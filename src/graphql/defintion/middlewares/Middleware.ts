import { GraphQLElement } from "../../types/GraphQLElement";
import { ResolveFunction } from "../../types/ResolveFunction";

export class Middleware extends GraphQLElement<ResolveFunction> {
  private _function;

  get function() {
    return this._function;
  }

  setFunction(fn: ResolveFunction) {
    this._function = fn;
  }

  protected constructor(fn: ResolveFunction, name?: string) {
    super(name);
    this.setFunction(fn);
  }

  static create(fn: ResolveFunction, name?: string) {
    return new Middleware(fn, name);
  }
}
