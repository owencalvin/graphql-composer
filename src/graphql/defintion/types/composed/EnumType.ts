import { GraphQLEnumType, GraphQLEnumValueConfigMap } from "graphql";
import { EnumValue } from "./EnumValue";
import { ComposedType } from "../ComposedType";

export class EnumType extends ComposedType<GraphQLEnumType> {
  private _values: EnumValue[] = [];

  static create(name: string) {
    return new EnumType(name);
  }

  addValues(...values: EnumValue[]) {
    this._values = [...this._values, ...values];
    return this;
  }

  copy() {
    return EnumType.create(this.name).addValues(...this._values);
  }

  build(): GraphQLEnumType {
    const values = this._values.reduce<GraphQLEnumValueConfigMap>(
      (prev, value) => {
        prev[value.name] = value.build();
        delete prev[value.name]["isDeprecated"];
        return prev;
      },
      {},
    );

    this._built = new GraphQLEnumType({
      name: this.name,
      description: this._description,
      values,
    });

    return this.built;
  }
}
