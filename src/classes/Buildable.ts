import { Extension } from "./Extension";
import { Directive } from "../definition";

export class Buildable<
  BuiltType,
  NameType = string,
  ExtensionsType = any
> extends Extension<ExtensionsType> {
  protected _built: BuiltType;
  protected _description?: string;

  get definitionNode(): any {
    return undefined;
  }

  get description() {
    return this._description;
  }

  get built() {
    return this._built;
  }

  static create(...args: any[]) {
    throw new Error("Method not overridden");
  }

  build(...args: any[]) {
    throw new Error("Method not overridden");
  }

  setDescription(description: string) {
    this._description = description;
    return this;
  }
}
