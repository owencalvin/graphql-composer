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

export type TranformableTypes =
  | typeof ObjectType
  | typeof InterfaceType
  | typeof InputType
  | typeof GQLType;

export class Wrapper {
  protected _types: ComposedType[] = [];

  get types() {
    return this._types;
  }

  protected constructor(...types: ComposedType[]) {
    this.addTypes(...types);
  }

  static create(...types: ComposedType[]) {
    const wrapper = new Wrapper(...types);
    return wrapper;
  }

  addTypes(...types: ComposedType[]) {
    this._types = [...this._types, ...types];
    return this;
  }

  addMiddlewares(...middlewares: Middleware[]) {
    this.transformFields(Field, (f) => {
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

  transformFields<T extends typeof Field | typeof InputField | typeof GQLField>(
    fieldType: T,
    cb: (field: InstanceOf<T>) => void,
  ) {
    const fieldTypeMap = new Map<any, TranformableTypes[]>([
      [Field, [ObjectType, InterfaceType]],
      [InputField, [InputType]],
      [GQLField, [GQLType]],
    ]);

    fieldTypeMap.get(fieldType).map((ot) => {
      this.transform(ot, (t) => {
        t.fields.map((f) => {
          cb(f as any);
        });
      });
    });
  }
}
