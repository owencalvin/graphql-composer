import { GraphQLTypeResolver } from "graphql";
import { KeyValue } from "..";

export interface TypeResolvable {
  defaultTypeResolver(obj: KeyValue): any;
  setTypeResolver<TSource = any, TContext = any>(
    typeResolver: GraphQLTypeResolver<TSource, TContext>,
  ): any;
}
