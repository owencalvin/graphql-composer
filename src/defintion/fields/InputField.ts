import { GraphQLInputField } from "graphql";
import {
  InputFieldType,
  StringKeyOf,
  InstanceOf,
  TypeParser,
  Field,
  Arg,
  KeyValue,
} from "../..";
import { GQLField } from "./GQLField";

export class InputField<
  NameType = string,
  MetaType = KeyValue
> extends GQLField<GraphQLInputField, NameType, MetaType> {
  protected _defaultValue: string | number | boolean;
  protected _type: InputFieldType;

  get type() {
    return this._type;
  }

  protected constructor(name: NameType & string, type: InputFieldType) {
    super(name, type);
  }

  /**
   * Create a field for an InputType
   */
  static create<NameType = any>(
    name: StringKeyOf<NameType>,
    type: InputFieldType,
  ): InputField<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: Field<any>,
  ): InputField<StringKeyOf<NameType>>;
  static create<NameType = any>(
    field: InputField<any>,
  ): InputField<StringKeyOf<NameType>>;
  static create<NameType = any>(
    nameOrField: StringKeyOf<InstanceOf<NameType>> | GQLField,
    type?: InputFieldType,
  ) {
    if (typeof nameOrField === "string") {
      return new InputField(nameOrField as string, type);
    } else if (nameOrField instanceof GQLField) {
      const field = InputField.create(
        nameOrField.name,
        nameOrField.type as InputFieldType,
      )
        .setDescription(nameOrField.description)
        .setMeta(nameOrField.meta)
        .setDeprecationReason(nameOrField.deprecationReason);
      return field;
    }
  }

  build() {
    const input: GraphQLInputField = {
      name: this._name,
      type: TypeParser.parse(this._type),
      description: this._description,
      defaultValue: this._defaultValue,
      astNode: undefined,
      extensions: [],
    };

    this._built = input;

    return this.built;
  }

  copy(): InputField<NameType> {
    return InputField.create(this) as any;
  }

  convert(to: typeof Arg): Arg<NameType>;
  convert(to: typeof Field): Field<NameType>;
  convert(to: typeof Field | typeof Arg) {
    return (to.create as any)(this.name, this.type as any) as any;
  }
}
