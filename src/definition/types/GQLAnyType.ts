import { KeyValue } from "../..";
import { GQLElement } from "../../classes/GQLElement";

export abstract class GQLAnyType<
  BuiltType = any,
  MetaType = any
> extends GQLElement<BuiltType, any, MetaType> {
  constructor(name?: string) {
    super(name);
  }

  abstract build(): BuiltType;
}
