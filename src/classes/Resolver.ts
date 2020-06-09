import { KeyValue, Next } from "..";

export abstract class Resolver<T = KeyValue> {
  abstract resolve(args: T, gql: any, next: Next, nextArgs: KeyValue);
}
