import { GQLField } from "../fields/GQLField";
import { ObjectType } from "./ObjectType";
import { InterfaceType } from "./InterfaceType";
import { InputType } from "./InputType";
import { InputField } from "../fields/InputField";
import { Field } from "../fields/Field";
import { ComposedType } from "./composed/ComposedType";
import { NotNullableType, NotNullable } from "../modifiers/NotNullable";
import { ArrayHelper, Removable } from "../../helpers/ArrayHelper";

export abstract class GQLType<BuiltType = any> extends ComposedType<BuiltType> {
  protected _fields: GQLField[] = [];
  protected _hidden = false;
  protected _extension?: GQLType;

  get fields() {
    return this._fields;
  }

  get hidden() {
    return this._hidden;
  }

  constructor(name?: string) {
    super(name);
  }

  setFields(...fields: GQLField[]) {
    this._fields = fields;
    return this;
  }

  addFields(...fields: GQLField[]) {
    return this.setFields(...this._fields, ...fields);
  }

  removeFields(...fields: Removable<GQLField>) {
    return this.setFields(...ArrayHelper.remove(fields, this._fields));
  }

  setExtension(extension: GQLType) {
    this._extension = extension;
    return this;
  }

  setHidden(hidden: boolean) {
    this._hidden = hidden;
    return this;
  }

  partial() {
    this.transformFields((field) => {
      if (field.type instanceof NotNullableType) {
        field.setType(field.type.type);
      }
      return {};
    });
    return this;
  }

  required() {
    this.transformFields((field) => {
      if (!(field.type instanceof NotNullableType)) {
        field.setType(NotNullable(field.type));
      }
      return {};
    });
    return this;
  }

  protected preBuild() {
    this._fields = [...this._fields, ...(this._extension?._fields || [])];
    return this;
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

  protected applyFieldsTransformation<FieldType extends InputField | Field>(
    cb: (field: FieldType) => void,
  ) {
    return this.fields.map((field) => {
      cb(field as FieldType);
    });
  }

  abstract convert(
    to: typeof InterfaceType | typeof InputType,
  ): InputType | ObjectType | InterfaceType;

  abstract copy(): InputType | ObjectType | InterfaceType;

  abstract transformFields(cb: (field: InputField | Field) => void);
}
