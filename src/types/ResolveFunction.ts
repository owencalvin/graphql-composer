import { KeyValue, Next, Context } from "..";

export type ResolveFunction<
  ReturnType = any,
  ArgsType = KeyValue,
  SourceType = any
> = (
  args: ArgsType,
  context: Context<ReturnType, SourceType>,
  next: Next,
) => Promise<ReturnType> | ReturnType;
