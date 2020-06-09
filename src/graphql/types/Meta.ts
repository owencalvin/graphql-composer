export class Meta<MetaType = any> {
  protected _meta?: MetaType;

  get meta() {
    return this._meta;
  }

  setMeta(meta: any) {
    this._meta = meta;
    return this;
  }

  getMeta<TMetaType = any>(): TMetaType {
    return this.meta as any;
  }
}
