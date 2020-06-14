import { GraphQLResolveInfo } from "graphql";
import { Field } from "..";
import { KeyValue } from "../types";

/**
 * The request context
 */
export interface Context<BodyType = any, SourceType = any> {
  body: BodyType;
  context: any;
  infos: GraphQLResolveInfo;
  source: SourceType;
  field: Field;
  rawArgs: KeyValue;
}
