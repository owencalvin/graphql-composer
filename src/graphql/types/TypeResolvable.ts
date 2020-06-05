import { KeyValue } from "../../shared/KeyValue";
import { GraphQLTypeResolver } from "graphql";

export interface TypeResolvable {
  defaultTypeResolver(obj: KeyValue): any;
  setTypeResolver<TSource = any, TContext = any>(
    typeResolver: GraphQLTypeResolver<TSource, TContext>,
  ): any;
}
