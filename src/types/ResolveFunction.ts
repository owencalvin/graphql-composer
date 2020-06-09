import { KeyValue, Next } from "..";

export type ResolveFunction<ReturnType = any, ArgsType = KeyValue> = (
  args: ArgsType,
  gql: any,
  next: Next,
  paramsToNext: KeyValue,
) => Promise<ReturnType> | ReturnType;
