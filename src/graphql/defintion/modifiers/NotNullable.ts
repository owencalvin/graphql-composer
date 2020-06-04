import { FieldType } from "../../types/FieldType";

export function NotNullable(type: FieldType) {
  return new NotNullableType(type);
}

export class NotNullableType {
  private _type: FieldType;

  get type() {
    return this._type;
  }

  constructor(type: FieldType) {
    this._type = type;
  }
}
