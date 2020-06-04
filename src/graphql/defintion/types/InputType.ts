import { Type } from "./Type";
import { GraphQLInputObjectType } from "graphql";
import { InputField } from "../fields/InputField";
import { TypeConverter, ConversionType } from "../../helpers/TypeConverter";

export class InputType extends Type<GraphQLInputObjectType> {
  protected _fields: InputField[];

  get fields() {
    return this._fields;
  }

  static create(name?: string) {
    return new InputType(name);
  }

  build(): GraphQLInputObjectType {
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

    return input;
  }

  convert<Target extends ConversionType>(to: Target) {
    return TypeConverter.convert<Target>(this, to);
  }
}
