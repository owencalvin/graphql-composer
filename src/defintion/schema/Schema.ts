import { GraphQLSchema, GraphQLObjectType, GraphQLNamedType } from "graphql";
import {
  Wrapper,
  GQLElement,
  Removable,
  ArrayHelper,
  GQLAnyType,
  KeyValue,
  SchemaConfig,
} from "../..";

export class Schema<MetaType = KeyValue> extends GQLElement<
  GraphQLSchema,
  any,
  MetaType
> {
  protected _types: GQLAnyType[] = [];
  private static _config: SchemaConfig = {};

  static get config() {
    return this._config;
  }

  /**
   * Set the type list to build
   * @param types The type list to build
   */
  setTypes(...types: (GQLAnyType | Wrapper)[]) {
    this._types = [
      ...types
        .flatMap((item) => {
          if (item instanceof Wrapper) {
            return item.types;
          }
          return item as GQLAnyType;
        })
        .filter((t) => t),
    ];
    return this;
  }

  /**
   * Add a type to the list to build
   * @param types The type list to build
   */
  addTypes(...types: (GQLAnyType | Wrapper)[]) {
    return this.setTypes(...this._types, ...types);
  }

  /**
   * Remove some types to the list
   * @param types The type list to remove
   */
  removeTypes(...types: Removable<GQLAnyType>) {
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
  static create(...types: (GQLAnyType | Wrapper)[]) {
    const schema = new Schema();
    schema.setTypes(...types);
    return schema;
  }
}
