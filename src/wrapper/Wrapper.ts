import { ObjectType } from "../graphql/defintion/types/ObjectType";
import { InterfaceType } from "../graphql/defintion/types/InterfaceType";
import { Field } from "../graphql/defintion/fields/Field";
import { ComposedType } from "../graphql/defintion/types/composed/ComposedType";
import { InputField } from "../graphql/defintion/fields/InputField";
import { InputType } from "../graphql/defintion/types/InputType";
import { InstanceOf } from "../shared/InstanceOf";
import { ClassDescriptor } from "../graphql/helpers/ClassDescriptor";
import { GQLField } from "../graphql/defintion/fields/GQLField";
import { GQLType } from "../graphql/defintion/types/GQLType";
import { Middleware } from "../graphql/defintion/middlewares/Middleware";
import { Removable, ArrayHelper } from "../graphql/helpers/ArrayHelper";
import { GQLObjectType } from "../graphql/defintion/types/GQLObjectType";

export type TranformableTypes =
  | typeof ObjectType
  | typeof InterfaceType
  | typeof InputType
  | typeof GQLObjectType
  | typeof GQLType;

export class Wrapper {
  protected _types: ComposedType[] = [];

  get types() {
    return this._types;
  }

  protected constructor(...types: ComposedType[]) {
    this.setTypes(...types);
  }

  static create(...types: ComposedType[]) {
    const wrapper = new Wrapper(...types);
    return wrapper;
  }

  setTypes(...types: ComposedType[]) {
    this._types = types;
    return this;
  }

  addTypes(...types: ComposedType[]) {
    return this.setTypes(...this._types, ...types);
  }

  removeTypes(...types: Removable<ComposedType>) {
    return this.setTypes(...ArrayHelper.remove(types, this._types));
  }

  addMiddlewares(...middlewares: Middleware[]) {
    this.transformFields(GQLObjectType, (f) => {
      f.addMiddlewares(...middlewares);
    });
  }

  transform<T extends TranformableTypes>(
    toTransform: T,
    cb: (type: InstanceOf<T>) => void,
  ) {
    this._types.map((t) => {
      if (ClassDescriptor.instanceOf(t, toTransform)) {
        cb(t as InstanceOf<T>);
      }
    });
  }

  transformFields(fieldType: typeof ObjectType, cb: (field: Field) => void);
  transformFields(fieldType: typeof InterfaceType, cb: (field: Field) => void);
  transformFields(fieldType: typeof InputType, cb: (field: InputField) => void);
  transformFields(fieldType: typeof GQLObjectType, cb: (field: Field) => void);
  transformFields(fieldType: typeof GQLType, cb: (field: GQLField) => void);
  transformFields(fieldType: TranformableTypes, cb: (field: any) => void) {
    this.transform(fieldType, (f: GQLType) => {
      f.fields.map(cb);
    });
  }
}
