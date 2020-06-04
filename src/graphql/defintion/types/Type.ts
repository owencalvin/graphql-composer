import { Field } from "../fields/Field";
import { GraphQLElement } from "../../types/GraphQLElement";
import { GraphQLNamedType } from "graphql";

export abstract class Type<
  BuiltType = any
> extends GraphQLElement<BuiltType> {
  protected _fields: Field[] = [];
  protected _hidden = false;
  protected _extension?: Type;

  get fields() {
    return this._fields;
  }

  get hidden() {
    return this._hidden;
  }

  addFields(...fields: Field[]) {
    this._fields = [...this._fields, ...fields];
    return this;
  }

  setExtension(extension: Type) {
    this._extension = extension;
    return this;
  }

  setHidden(hidden: boolean) {
    this._hidden = hidden;
    return this;
  }

  abstract build(): GraphQLNamedType;

  protected preBuild() {
    this._fields = [
      ...this._fields,
      ...(this._extension?._fields || []),
    ];
    return this;
  }

  protected constructor(name?: string) {
    super(name);
  }
}
