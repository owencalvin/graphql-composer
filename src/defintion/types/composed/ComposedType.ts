import { GraphQLElement } from "../../../types/GraphQLElement";

export abstract class ComposedType<BuiltType = any> extends GraphQLElement<
  BuiltType
> {
  constructor(name?: string) {
    super(name);
  }

  abstract build(): BuiltType;
}
