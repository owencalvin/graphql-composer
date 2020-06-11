import { GraphQLResolveInfo, Source } from "graphql";
import { Field } from "..";
import { KeyValue } from "../types";

/**
 * The request context
 */
export interface Context<BodyType = any> {
  body: BodyType;
  context: any;
  infos: GraphQLResolveInfo;
  source: Source;
  field: Field;
  rawArgs: KeyValue;
}
