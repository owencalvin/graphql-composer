import { KeyValue } from "../../shared/KeyValue";
import { Next } from "./Next";

export type ResolveFunction<ArgsType = KeyValue> = (
  args: ArgsType,
  gql: any,
  next: Next,
  paramsToNext: KeyValue,
) => any;
