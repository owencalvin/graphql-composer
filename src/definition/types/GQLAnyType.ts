import { KeyValue } from "../..";
import { GQLElement } from "../../classes/GQLElement";

export abstract class GQLAnyType<
  BuiltType = any,
  ExtensionsType = any
> extends GQLElement<BuiltType, any, ExtensionsType> {
  constructor(name?: string) {
    super(name);
  }

  abstract build(): BuiltType;
}
