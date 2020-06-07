import { GraphQLElement } from "../../../../types/GraphQLElement";
import { GraphQLEnumValue } from "graphql";
import { StringKeyOf } from "../../../../types/StringKeyOf";

export class EnumValue<NameType = string> extends GraphQLElement<any> {
  protected _name: NameType & string;
  private _value: any;
  private _deprecationReason: string;

  get name(): NameType & string {
    return this._name;
  }

  get value() {
    return this._value;
  }

  setType(value: any) {
    this._value = value;
  }

  static create<NameType = any>(
    name: StringKeyOf<NameType>,
    value: any,
  ): EnumValue<StringKeyOf<NameType>> {
    return new EnumValue(name, value);
  }

  protected constructor(name: string, value: any) {
    super(name);
    this.setType(value);
  }

  build(): GraphQLEnumValue {
    this._built = {
      name: this.name,
      value: this.value,
      deprecationReason: this._deprecationReason,
      description: this._description,
      isDeprecated: !!this._deprecationReason,
      extensions: [],
    };

    return { ...this._built };
  }
}
