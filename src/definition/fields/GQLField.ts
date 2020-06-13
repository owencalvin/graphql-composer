import { GraphQLField, GraphQLInputField } from "graphql";
import {
  FieldType,
  InputFieldType,
  RequiredType,
  Required,
  KeyValue,
} from "../..";
import { GQLElement } from "../../classes/GQLElement";
import { Nullable, NullableType } from "../modifiers/Nullable";

export abstract class GQLField<
  BuiltType = any,
  NameType = string,
  MetaType = any
> extends GQLElement<BuiltType, NameType, MetaType> {
  protected _type: FieldType | InputFieldType;
  protected _deprecationReason: string;
  protected _description: string;

  get type() {
    return this._type;
  }

  get description() {
    return this._description;
  }

  get deprecationReason() {
    return this._deprecationReason;
  }

  constructor(name: NameType & string, type: FieldType | InputFieldType) {
    super(name);
    this.setType(type);
  }

  abstract build(): GraphQLField<any, any, any> | GraphQLInputField;

  /**
   * Set the field type
   * @param type the type of your field
   */
  setType(type: FieldType | InputFieldType) {
    this._type = type;
    return this;
  }

  /**
   * Set the description of the field
   * @param deprecationReason The deprecation reason
   */
  setDescription(description: string) {
    this._description = description;
    return this;
  }

  /**
   * Set the deprecation reason of the field
   * @param deprecationReason The deprecation reason
   */
  setDeprecationReason(deprecationReason: string) {
    this._deprecationReason = deprecationReason;
    return this;
  }

  /**
   * Convert your field type into a nullable type
   */
  nullable() {
    if (this.type instanceof RequiredType) {
      this._type = (this._type as RequiredType).type;
    }
    if (!(this.type instanceof NullableType)) {
      this.setType(Nullable<any>(this._type));
    }
    return this;
  }

  /**
   * Convert your field type into a not nullable type
   */
  required() {
    if (this.type instanceof NullableType) {
      this._type = (this._type as NullableType).type;
    }
    if (!(this.type instanceof RequiredType)) {
      this.setType(Required<any>(this._type));
    }
    return this;
  }
}
