import {
  GQLField,
  InputField,
  Field,
  ArrayHelper,
  Removable,
  ClassType,
  InstanceOf,
  ConversionType,
  KeyValue,
} from "../../..";
import { GQLBasicType } from "./GQLBasicType";

export abstract class GQLType<
  BuiltType = any,
  T extends ClassType<any> = any,
  ExtensionsType = any
> extends GQLBasicType<BuiltType, any, ExtensionsType> {
  protected _fields: GQLField[] = [];
  protected _classType?: T;

  get fields() {
    return this._fields;
  }

  /**
   * Convert your type into a new one
   * @param to The target type
   */
  abstract convert<Target extends ConversionType>(
    to: Target,
  ): InstanceOf<Target>;

  /**
   * Apply a transformation to your fields
   * @param cb The callback with the field instance as the first parameter
   */
  abstract transformFields(cb: (field: InputField | Field) => void): this;

  /**
   * Set the field list
   * @param fields The fields list
   */
  setFields(...fields: GQLField[]): GQLType {
    this._fields = fields;
    return this;
  }

  /**
   * Add some fields to the fields list
   * @param fields The fields list
   */
  addFields(...fields: GQLField[]) {
    return this.setFields(...this._fields, ...fields);
  }

  /**
   * Remove some fields from the fields list
   * @param fields The fields IDs
   */
  removeFields(...fields: Removable<GQLField>) {
    return this.setFields(...ArrayHelper.remove(fields, this._fields));
  }

  /**
   * Make all the fields nullable
   */
  partial() {
    return this.transformFields((field) => {
      field.nullable();
    });
  }

  /**
   * Make all the fields not nullable
   */
  required() {
    return this.transformFields((field) => {
      field.required();
    });
  }
}
