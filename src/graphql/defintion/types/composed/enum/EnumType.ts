import { GraphQLEnumType, GraphQLEnumValueConfigMap } from "graphql";
import { EnumValue } from "./EnumValue";
import { ComposedType } from "../ComposedType";
import { Removable, ArrayHelper } from "../../../../helpers/ArrayHelper";
import { StringKeyOf } from "../../../../types/StringKeyOf";

export class EnumType<TEnumType extends Object = any> extends ComposedType<
  GraphQLEnumType
> {
  private _values: EnumValue<StringKeyOf<TEnumType>>[] = [];
  private _enumType?: TEnumType;

  get enumType() {
    return this._enumType;
  }

  protected constructor(name: string, enumType?: TEnumType) {
    super(name);

    this._enumType = enumType;
    Object.keys(enumType).map((key) => {
      this.addValues(EnumValue.create(key, enumType[key]) as any);
    });
  }

  static create(name: string): EnumType;
  static create<T extends Object>(name: string, enumType: T): EnumType<T>;
  static create<T extends Object>(name: string, enumType?: T) {
    return new EnumType(name, enumType);
  }

  setValues(...values: EnumValue<StringKeyOf<TEnumType>>[]) {
    this._values = values;
    return this;
  }

  addValues(...values: EnumValue<StringKeyOf<TEnumType>>[]) {
    return this.setValues(...this._values, ...values);
  }

  removeValues(...values: Removable<EnumValue>) {
    return this.setValues(...(ArrayHelper.remove(values, this._values) as any));
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
