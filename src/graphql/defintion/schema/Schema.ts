import { GraphQLSchema, GraphQLObjectType, GraphQLNamedType } from "graphql";
import { Wrapper } from "../../../wrapper/Wrapper";
import { ComposedType } from "../types/composed/ComposedType";
import { GraphQLElement } from "../../types/GraphQLElement";
import { Removable, ArrayHelper } from "../../helpers/ArrayHelper";
import { Type } from "../../types/Type";
import { ClassType } from "../../../shared/ClassType";

export class Schema extends GraphQLElement<GraphQLSchema> {
  protected _types: ComposedType[] = [];

  setTypes(...types: (ComposedType | Wrapper | typeof Type)[]) {
    this._types = [
      ...types
        .flatMap((item) => {
          if (item instanceof Wrapper) {
            return item.types.map(this.parseClassToTypes);
          } else {
            try {
              return this.parseClassToTypes(item);
            } catch (err) {}
          }
          return item as ComposedType;
        })
        .filter((t) => t),
    ];
    return this;
  }

  addTypes(...types: (ComposedType | Wrapper | typeof Type)[]) {
    return this.setTypes(...this._types, ...types);
  }

  removeTypes(...types: Removable<ComposedType>) {
    return this.setTypes(...ArrayHelper.remove(types, this._types));
  }

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

  static create(...types: (ComposedType | Wrapper | typeof Type)[]) {
    const schema = new Schema();
    schema.setTypes(...types);
    return schema;
  }

  protected parseClassToTypes(item: any) {
    try {
      const instance = new (item as ClassType)();
      if (instance instanceof Type) {
        return [
          instance.getInputType(),
          instance.getInterfaceType(),
          instance.getObjectType(),
        ];
      }
    } catch (err) {
      throw err;
    }
    return item;
  }
}
