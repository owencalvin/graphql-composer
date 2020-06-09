import { GQLElement } from "../..";

export abstract class GQLAnyType<BuiltType = any> extends GQLElement<
  BuiltType
> {
  constructor(name?: string) {
    super(name);
  }

  abstract build(): BuiltType;
}
