import { GQLType } from "./GQLType";
import { GraphQLInputObjectType } from "graphql";
import { InputField } from "../fields/InputField";
import { TypeConverter, ConversionType } from "../../helpers/TypeConverter";

export class InputType extends GQLType<GraphQLInputObjectType> {
  protected _fields: InputField[];

  get fields() {
    return this._fields;
  }

  static create(name: string) {
    return new InputType(name);
  }

  build() {
    this.preBuild();

    const input: GraphQLInputObjectType = {
      name: this._name,
      description: this._description,
      getFields: () => {
        return this.toConfigMap(this.fields);
      },
      extensions: [],
      astNode: undefined,
      extensionASTNodes: undefined,
      toConfig: undefined,
      toJSON: undefined,
      inspect: undefined,
    };

    this._built = input;

    return input;
  }

  convert<Target extends ConversionType>(to: Target) {
    return TypeConverter.convert<Target>(this, to);
  }

  copy() {
    return InputType.create(this.name)
      .setDescription(this._description)
      .setHidden(this._hidden)
      .setExtension(this._extension)
      .addFields(...this._fields);
  }

  transformFields(cb: (field: InputField) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }
}
