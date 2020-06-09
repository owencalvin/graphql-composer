export class Meta<MetaType = any> {
  protected _meta?: MetaType;

  get meta() {
    return this._meta;
  }

  /**
   * Add some meta data to your object
   * @param meta The data to add
   */
  setMeta(meta: MetaType) {
    this._meta = meta;
    return this;
  }

  /**
   * Get the meta data as a specific type
   */
  getMeta<TMetaType = any>(): TMetaType {
    return this.meta as any;
  }
}
