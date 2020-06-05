import { ObjectType } from "../graphql/defintion/types/ObjectType";
import { InterfaceType } from "../graphql/defintion/types/InterfaceType";
import { ResolveFunction } from "../graphql/types/ResolveFunction";
import { ObjectField } from "../graphql/defintion/fields/ObjectField";

export type Wrappable = ObjectType | InterfaceType;

export class Wrapper {
  protected _types: Wrappable[] = [];

  get types() {
    return this._types;
  }

  protected constructor(...types: Wrappable[]) {
    this.addTypes(...types);
  }

  static create(...types: Wrappable[]) {
    const wrapper = new Wrapper(...types);
    return wrapper;
  }

  addTypes(...types: Wrappable[]) {
    this._types = [...this._types, ...types];
    return this;
  }

  addMiddlewares(...middlewares: ResolveFunction[]) {
    this.transformFields((f) => {
      f.addMiddlewares(...middlewares);
    });
  }

  transformFields(cb: (field: ObjectField, type: Wrappable) => void) {
    this._types.map((t) => {
      t.fields.map((f) => {
        cb(f, t);
      });
    });
  }
}
