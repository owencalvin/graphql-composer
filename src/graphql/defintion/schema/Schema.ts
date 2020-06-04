import { Type } from "../types/Type";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNamedType,
} from "graphql";

export class Schema {
  protected _schema: GraphQLSchema;
  protected _types: Type[] = [];

  addTypes(...types: Type[]) {
    this._types = [...this._types, ...types];
    return this;
  }

  build() {
    const types = this._types.map<
      [string, GraphQLNamedType]
    >((t) => [t.name, t.build()]);
    const typesMap = new Map(types);

    const query = typesMap.get(
      "Query",
    ) as GraphQLObjectType;
    const mutation = typesMap.get(
      "Mutation",
    ) as GraphQLObjectType;
    const subscription = typesMap.get(
      "Subscription",
    ) as GraphQLObjectType;

    this._schema = new GraphQLSchema({
      query,
      mutation,
      subscription,
      types: types.map((t) => t[1]),
    });

    return this._schema;
  }

  protected constructor() {}

  static create() {
    const schema = new Schema();
    return schema;
  }
}
