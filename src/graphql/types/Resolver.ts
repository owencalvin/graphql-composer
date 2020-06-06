import { KeyValue } from "../../shared/KeyValue";
import { Next } from "./Next";
import { Args } from "../defintion/fields/Args";

export abstract class Resolver<T = KeyValue> {
  abstract resolve(args: T, gql: any, next: Next, nextArgs: KeyValue);

  getArgs(): Args | undefined {
    return undefined;
  }
}
