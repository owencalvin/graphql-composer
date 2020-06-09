import { KeyValue } from "../../shared/KeyValue";
import { Next } from "./Next";

export abstract class Resolver<T = KeyValue> {
  abstract resolve(args: T, gql: any, next: Next, nextArgs: KeyValue);
}
