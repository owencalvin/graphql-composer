import { FieldType } from "../../types/FieldType";
import { InputFieldType } from "../../types/InputFieldType";

export function NotNullable(type: FieldType | InputFieldType) {
  return new NotNullableType(type);
}

export class NotNullableType {
  private _type: FieldType | InputFieldType;

  get type() {
    return this._type;
  }

  constructor(type: FieldType | InputFieldType) {
    this._type = type;
  }
}
