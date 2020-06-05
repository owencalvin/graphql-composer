import { Field } from "../fields/Field";
import { ObjectType } from "./ObjectType";
import { InterfaceType } from "./InterfaceType";
import { InputType } from "./InputType";
import { InputField } from "../fields/InputField";
import { ObjectField } from "../fields/ObjectField";
import { ComposedType } from "./composed/ComposedType";
import { NotNullableType, NotNullable } from "../modifiers/NotNullable";

export abstract class Type<BuiltType = any> extends ComposedType<BuiltType> {
  protected _fields: Field[] = [];
  protected _hidden = false;
  protected _extension?: Type;

  get fields() {
    return this._fields;
  }

  get hidden() {
    return this._hidden;
  }

  constructor(name?: string) {
    super(name);
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

  partial() {
    this.transformFields((field) => {
      if (field.type instanceof NotNullableType) {
        field.setType(field.type.type);
      }
      return {};
    });
  }

  required() {
    this.transformFields((field) => {
      if (!(field.type instanceof NotNullableType)) {
        field.setType(NotNullable(field.type));
      }
      return {};
    });
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

  protected applyFieldsTransformation<
    FieldType extends InputField | ObjectField
  >(cb: (field: FieldType) => void) {
    return this.fields.map((field) => {
      cb(field as FieldType);
    });
  }

  abstract convert(
    to: typeof InterfaceType | typeof InputType,
  ): InputType | ObjectType | InterfaceType;

  abstract copy(): InputType | ObjectType | InterfaceType;

  abstract transformFields(cb: (field: InputField | ObjectField) => void);
}
