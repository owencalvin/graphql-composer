import { GraphQLArgument } from "graphql";
import { InputFieldType, StringKeyOf, TypeParser, KeyValue } from "../..";
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
  ): Arg<StringKeyOf<NameType>> {
    return new Arg<StringKeyOf<NameType>>(name, type);
  }

  build(): GraphQLArgument {
    return {
      name: this._name,
      type: TypeParser.parse(this._type),
      description: this._description,
      defaultValue: this._defaultValue,
      astNode: undefined,
      extensions: [],
    };
  }
}
