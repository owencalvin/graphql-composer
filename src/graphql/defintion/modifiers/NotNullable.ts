import { FieldType } from "../../types/FieldType";

export class NotNullable {
  private _type: FieldType;

  get type() {
    return this._type;
  }

  constructor(type: FieldType) {
    this._type = type;
  }
}
