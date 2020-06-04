export class GraphQLElement<BuiltType> {
  protected _name: string;
  protected _ref: symbol;
  protected _built: BuiltType;

  get ref() {
    return this._ref;
  }

  get name() {
    return this._name;
  }

  get built() {
    return this._built;
  }

  protected constructor(name?: string) {
    this.setName(name);
    this._ref = Symbol();
  }

  setName(name: string) {
    this._name = name;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(name?: string, ...args: any[]) {
    return new GraphQLElement(name);
  }
}
