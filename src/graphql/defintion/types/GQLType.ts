import { GQLField } from "../fields/GQLField";
import { InputField } from "../fields/InputField";
import { Field } from "../fields/Field";
import { ArrayHelper, Removable } from "../../helpers/ArrayHelper";
import { ClassType } from "../../../shared/ClassType";
import { GQLBasicType } from "./GQLBasicType";
import { InstanceOf } from "../../../shared/InstanceOf";
import { ConversionType } from "../../types/ConversionType";

export abstract class GQLType<
  BuiltType = any,
  T extends ClassType<any> = any
> extends GQLBasicType<BuiltType> {
  protected _fields: GQLField[] = [];
  protected _classType?: T;

  get fields() {
    return this._fields;
  }

  abstract convert<Target extends ConversionType>(
    to: Target,
  ): InstanceOf<Target>;

  abstract transformFields(cb: (field: InputField | Field) => void): this;

  setFields(...fields: GQLField[]): GQLType {
    this._fields = fields;
    return this;
  }

  addFields(...fields: GQLField[]) {
    return this.setFields(...this._fields, ...fields);
  }

  removeFields(...fields: Removable<GQLField>) {
    return this.setFields(...ArrayHelper.remove(fields, this._fields));
  }

  partial() {
    return this.transformFields((field) => {
      field.nullable();
    });
  }

  required() {
    return this.transformFields((field) => {
      field.required();
    });
  }
}
