import { KeyValue, Next, Context } from "..";

export type ResolveFunction<ReturnType = any, ArgsType = KeyValue> = (
  args: ArgsType,
  gql: Context<ReturnType>,
  next: Next,
) => Promise<ReturnType> | ReturnType;
