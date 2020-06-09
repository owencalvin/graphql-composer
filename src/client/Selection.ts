import { StringKeyOf } from "../types/StringKeyOf";

export class Selection<Type = any> {
  private _properties: StringKeyOf<Type>[];
  private _selections: Selection;

  get properties() {
    return this._properties;
  }

  get selections() {
    return this._selections;
  }

  protected constructor(...properties: StringKeyOf<Type>[]) {
    this._properties = properties;
  }

  static create<Type = any>(...properties: StringKeyOf<Type>[]) {
    return new Selection(...properties);
  }

  setSelections(selections: Selection) {
    this._selections = selections;
    return this;
  }
}
