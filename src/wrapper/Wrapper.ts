import { Type } from "../graphql/defintion/types/Type";

export class Wrapper {
  protected _types: Type[] = [];

  get types() {
    return this._types;
  }

  addTypes(...types: Type[]) {
    this._types = [...this._types, ...types];
    return this;
  }
}
