import { Meta } from "./Meta";
import { KeyValue } from "../types";

export class GQLElement<
  BuiltType,
  NameType = string,
  MetaType = KeyValue
> extends Meta<MetaType> {
  protected _name: NameType & string;
  protected _ref: symbol;
  protected _built: BuiltType;
  protected _description?: string;

  get description() {
    return this._description;
  }

  get ref() {
    return this._ref;
  }

  get name() {
    return this._name;
  }

  get built() {
    return this._built;
  }

  protected constructor(name?: NameType & string) {
    super();
    this.setName(name);
    this._ref = Symbol();
  }

  static built<BuiltType = any>(elements: GQLElement<BuiltType>[]) {
    return elements.map((e) => e.built);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(...args: any[]) {
    throw new Error("create method not implemented");
  }

  setName(name: NameType & string) {
    this._name = name;
    return this;
  }

  setDescription(description: string) {
    this._description = description;
    return this;
  }

  build() {}
}
