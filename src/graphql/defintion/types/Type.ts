import { Field } from "../fields/Field";
import { GraphQLElement } from "../../types/GraphQLElement";
import { GraphQLNamedType } from "graphql";
import { ObjectType } from "./ObjectType";
import { InterfaceType } from "./InterfaceType";
import { InputType } from "./InputType";

export abstract class Type<BuiltType = any> extends GraphQLElement<BuiltType> {
  protected _fields: Field[] = [];
  protected _hidden = false;
  protected _description?: string;
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

  setDescription(description: string) {
    this._description = description;
    return this;
  }

  abstract build(): GraphQLNamedType;

  abstract convert(
    to: typeof InterfaceType | typeof InputType,
  ): InputType | ObjectType | InterfaceType;

  protected preBuild() {
    this._fields = [...this._fields, ...(this._extension?._fields || [])];
    return this;
  }

  constructor(name?: string) {
    super(name);
  }

  protected toConfigMap<ReturnType>(
    arr: { name: string; build(): any }[],
  ): ReturnType {
    return arr.reduce<any>((prev, item) => {
      const built = item.build();
      prev[built.name] = {
        ...built,
      };
      return prev;
    }, {});
  }
}
