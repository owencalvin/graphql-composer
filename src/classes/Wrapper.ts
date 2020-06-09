import {
  ObjectType,
  InterfaceType,
  InputType,
  GQLObjectType,
  GQLType,
  GQLAnyType,
  Removable,
  ArrayHelper,
  Middleware,
  Field,
  InputField,
  GQLField,
} from "..";

export type TranformableTypes =
  | typeof ObjectType
  | typeof InterfaceType
  | typeof InputType
  | typeof GQLObjectType
  | typeof GQLType;

export class Wrapper {
  protected _types: GQLAnyType[] = [];

  get types() {
    return this._types;
  }

  protected constructor(...types: GQLAnyType[]) {
    this.setTypes(...types);
  }

  static create(...types: GQLAnyType[]) {
    const wrapper = new Wrapper(...types);
    return wrapper;
  }

  setTypes(...types: GQLAnyType[]) {
    this._types = types;
    return this;
  }

  addTypes(...types: GQLAnyType[]) {
    return this.setTypes(...this._types, ...types);
  }

  removeTypes(...types: Removable<GQLAnyType>) {
    return this.setTypes(...ArrayHelper.remove(types, this._types));
  }

  addMiddlewares(...middlewares: Middleware[]) {
    this.transformFields(GQLObjectType, (f) => {
      f.addMiddlewares(...middlewares);
    });
  }

  transform(toTransform: typeof ObjectType, cb: (type: ObjectType) => void);
  transform(toTransform: typeof InputType, cb: (field: InputType) => void);
  transform(toTransform: typeof GQLType, cb: (type: GQLType) => void);
  transform(
    toTransform: typeof InterfaceType,
    cb: (type: InterfaceType) => void,
  );
  transform(
    toTransform: typeof GQLObjectType,
    cb: (type: GQLObjectType) => void,
  );
  transform(toTransform: TranformableTypes, cb: (type: any) => void) {
    this._types.map((t) => {
      if (t instanceof toTransform) {
        cb(t as GQLType);
      }
    });
    return this;
  }

  transformFields(fieldType: typeof ObjectType, cb: (field: Field) => void);
  transformFields(fieldType: typeof InterfaceType, cb: (field: Field) => void);
  transformFields(fieldType: typeof InputType, cb: (field: InputField) => void);
  transformFields(fieldType: typeof GQLObjectType, cb: (field: Field) => void);
  transformFields(fieldType: typeof GQLType, cb: (field: GQLField) => void);
  transformFields(fieldType: TranformableTypes, cb: (field: any) => void) {
    return this.transform(fieldType as any, (f: GQLType) => {
      f.fields.map(cb);
    });
  }
}
