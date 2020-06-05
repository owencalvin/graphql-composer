import { GraphQLElement } from "../../../../types/GraphQLElement";
import { GraphQLEnumValue } from "graphql";

export class EnumValue extends GraphQLElement<any> {
  private _value: any;
  private _deprecationReason: string;

  get value() {
    return this._value;
  }

  setType(value: any) {
    this._value = value;
  }

  static create(name: string, value: any) {
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
