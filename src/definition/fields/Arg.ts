import { GraphQLArgument } from "graphql";
import {
  InputFieldType,
  StringKeyOf,
  TypeParser,
  KeyValue,
  InputField,
  Schema,
  Field,
} from "../..";
import { GQLField } from "./GQLField";

export class Arg<NameType = string, MetaType = KeyValue> extends GQLField<
  GraphQLArgument,
  NameType,
  MetaType
> {
  protected _defaultValue: string | number | boolean;
  protected _type: InputFieldType;

  get type() {
    return this._type;
  }

  protected constructor(name: NameType & string, type: InputFieldType) {
    super(name, type);
  }

  static create<NameType = any>(
    name: StringKeyOf<NameType>,
    type: InputFieldType,
  ): Arg<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: InputField<any>,
  ): Arg<StringKeyOf<NameType>>;
  static create<NameType = any>(field: Field<any>): Arg<StringKeyOf<NameType>>;
  static create<NameType = any>(
    nameOrField: StringKeyOf<NameType> | InputField<any> | Field<any>,
    type?: InputFieldType,
  ): Arg<StringKeyOf<NameType>> {
    if (typeof nameOrField === "string") {
      return new Arg<StringKeyOf<NameType>>(nameOrField, type);
    } else if (nameOrField instanceof GQLField) {
      return Arg.create<NameType>(nameOrField.name, nameOrField.type as any)
        .setDescription(nameOrField.description)
        .setMeta(nameOrField.meta)
        .setDeprecationReason(nameOrField.deprecationReason);
    }
  }

  build(): GraphQLArgument {
    return {
      name: this._name,
      type: TypeParser.parse(this._type, Schema.config.requiredByDefault),
      description: this._description,
      defaultValue: this._defaultValue,
      astNode: undefined,
      extensions: [],
    };
  }
}
