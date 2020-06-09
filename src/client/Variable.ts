import { InputFieldType } from "..";

export class Variable {
  private _name: string;
  private _type: InputFieldType;

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  protected constructor(name: string, type: InputFieldType) {
    this._name = name;
    this._type = type;
  }

  static create(name: string, type: InputFieldType) {
    return new Variable(name, type);
  }
}
