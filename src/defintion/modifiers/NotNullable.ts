import { FieldType } from "../../types/FieldType";
import { InputFieldType } from "../../types/InputFieldType";

/**
 * Create a nullable type from an existing one
 * @param type The type to convert
 */
export function NotNullable<
  Type extends FieldType | InputFieldType = FieldType
>(type: Type) {
  return new NotNullableType<Type>(type);
}

export class NotNullableType<
  Type extends FieldType | InputFieldType = FieldType
> {
  private _type: Type;

  get type() {
    return this._type;
  }

  constructor(type: Type) {
    this._type = type;
  }
}
