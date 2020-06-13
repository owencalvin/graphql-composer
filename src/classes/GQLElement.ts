import { ArrayHelper } from "../helpers";
import { Directive } from "../definition";
import { Buildable } from "./Buildable";

export class GQLElement<
  BuiltType,
  NameType = string,
  ExtensionsType = any
> extends Buildable<BuiltType, NameType, ExtensionsType> {
  protected _name: NameType & string;
  protected _directives: Directive[] = [];

  get definitionNode(): any {
    return undefined;
  }

  get description() {
    return this._description;
  }

  get name() {
    return this._name;
  }

  get directives() {
    return this._directives;
  }

  protected constructor(name?: NameType & string) {
    super();
    this.setName(name);
  }

  setName(name: NameType & string) {
    this._name = name;
    return this;
  }

  setDirectives(...directives: Directive[]) {
    this._directives = directives;
    return this;
  }

  addDirectives(...directives: Directive[]) {
    return this.setDirectives(...this.directives, ...directives);
  }

  removeDirectives(...directives: Directive[]) {
    return this.setDirectives(
      ...ArrayHelper.remove(directives, this._directives),
    );
  }
}
