export class Extension<ExtensionsType = any> {
  protected _extensions?: ExtensionsType;

  get extensions() {
    return this._extensions;
  }

  /**
   * Add some meta data to your object
   * @param extensions The data to add
   */
  setExtensions(extensions: ExtensionsType) {
    this._extensions = extensions;
    return this;
  }
}
