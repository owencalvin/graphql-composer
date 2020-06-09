import { GraphQLSchema, GraphQLObjectType, GraphQLNamedType } from "graphql";
import { Wrapper } from "../../wrapper/Wrapper";
import { ComposedType } from "../types/composed/ComposedType";
import { GraphQLElement } from "../../types/GraphQLElement";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";

export class Schema extends GraphQLElement<GraphQLSchema> {
  protected _types: ComposedType[] = [];

  /**
   * Set the type list to build
   * @param types The type list to build
   */
  setTypes(...types: (ComposedType | Wrapper)[]) {
    this._types = [
      ...types
        .flatMap((item) => {
          if (item instanceof Wrapper) {
            return item.types;
          }
          return item as ComposedType;
        })
        .filter((t) => t),
    ];
    return this;
  }

  /**
   * Add a type to the list to build
   * @param types The type list to build
   */
  addTypes(...types: (ComposedType | Wrapper)[]) {
    return this.setTypes(...this._types, ...types);
  }

  /**
   * Remove some types to the list
   * @param types The type list to remove
   */
  removeTypes(...types: Removable<ComposedType>) {
    return this.setTypes(...ArrayHelper.remove(types, this._types));
  }

  /**
   * Build the schema and all the types contained in it
   */
  build() {
    const types = this._types.map<[string, GraphQLNamedType]>((t) => [
      t.name,
      t.build(),
    ]);
    const typesMap = new Map(types);

    const query = typesMap.get("Query") as GraphQLObjectType;
    const mutation = typesMap.get("Mutation") as GraphQLObjectType;
    const subscription = typesMap.get("Subscription") as GraphQLObjectType;

    this._built = new GraphQLSchema({
      query,
      mutation,
      subscription,
      types: types.map((t) => t[1]),
      description: this._description,
    });

    return this._built;
  }

  protected constructor() {
    super();
  }

  /**
   * Create a new schema
   * @param types The type list to build
   */
  static create(...types: (ComposedType | Wrapper)[]) {
    const schema = new Schema();
    schema.setTypes(...types);
    return schema;
  }
}
