import { FieldType, InputFieldType } from "../..";

/**
 * Create a not nullable type from an existing one
 * @param type The type to convert
 */
export function Required<Type extends FieldType | InputFieldType = FieldType>(
  type: Type,
) {
  return new RequiredType<Type>(type);
}

export class RequiredType<Type extends FieldType | InputFieldType = FieldType> {
  private _type: Type;

  get type() {
    return this._type;
  }

  constructor(type: Type) {
    this._type = type;
  }
}
