import { GraphQLEnumType, GraphQLEnumValueConfigMap } from "graphql";
import {
  StringKeyOf,
  EnumValue,
  Removable,
  ArrayHelper,
  KeyValue,
} from "../../../..";
import { GQLAnyType } from "../../GQLAnyType";

export class EnumType<
  TEnumType extends Object = any,
  MetaType = KeyValue
> extends GQLAnyType<GraphQLEnumType, MetaType> {
  private _values: EnumValue<StringKeyOf<TEnumType>>[] = [];
  private _enumType?: TEnumType;

  get enumType() {
    return this._enumType;
  }

  get values(): readonly EnumValue<StringKeyOf<TEnumType>>[] {
    return this._values;
  }

  protected constructor(name: string, enumType?: TEnumType) {
    super(name);

    if (enumType) {
      this._enumType = enumType;
      Object.keys(enumType).map((key) => {
        this.addValues(EnumValue.create(key, enumType[key]) as any);
      });
    }
  }

  /**
   * Create an EnumType
   */
  static create(name: string): EnumType;
  static create<T extends Object>(name: string, enumType: T): EnumType<T>;
  static create<T extends Object>(name: string, enumType?: T) {
    return new EnumType(name, enumType);
  }

  /**
   * Set the enum values
   * @param values The values to add
   */
  setValues(...values: EnumValue<StringKeyOf<TEnumType>>[]) {
    this._values = values;
    return this;
  }

  /**
   * Add some enum values
   * @param values The values to add
   */
  addValues(...values: EnumValue<StringKeyOf<TEnumType>>[]) {
    return this.setValues(...this._values, ...values);
  }

  /**
   * Add a single enum value
   * @param name the value name
   * @param value the value
   */
  addValue(name: StringKeyOf<TEnumType>, value: any) {
    return this.addValues(EnumValue.create(name, value));
  }

  /**
   * Remove some values from the enum
   * @param values The values to remove
   */
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
