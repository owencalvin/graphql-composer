import { Field } from "../fields/Field";
import { ArrayHelper, Removable } from "../../helpers/ArrayHelper";
import { GQLType } from "./GQLType";
import { GraphQLFieldConfigMap, GraphQLFieldConfigArgumentMap } from "graphql";
import { ClassType } from "../../../shared/ClassType";
import { FieldType } from "../../types/FieldType";
import { StringKeyOf } from "../../types/StringKeyOf";
import { InstanceOf } from "../../../shared/InstanceOf";

export abstract class GQLObjectType<
  BuiltType = any,
  T extends ClassType<any> = any
> extends GQLType<BuiltType, T> {
  protected _fields: Field<StringKeyOf<InstanceOf<T>>>[] = [];

  get fields() {
    return this._fields;
  }

  constructor(name: string) {
    super(name);
  }

  setFields(...fields: Field<StringKeyOf<InstanceOf<T>>>[]) {
    this._fields = fields;
    return this;
  }

  addField(name: StringKeyOf<InstanceOf<T>>, type: FieldType) {
    return this.setFields(
      ...this._fields,
      Field.create<StringKeyOf<InstanceOf<T>>>(name, type),
    );
  }

  addFields(...fields: Field<StringKeyOf<InstanceOf<T>>>[]) {
    return this.setFields(...this._fields, ...fields);
  }

  removeFields(...fields: Removable<Field<StringKeyOf<InstanceOf<T>>>>) {
    return this.setFields(...ArrayHelper.remove(fields, this._fields));
  }

  getField(name: StringKeyOf<InstanceOf<T>>) {
    return ArrayHelper.find({ name }, this._fields).ref;
  }

  protected getFields() {
    return this.fields.reduce<GraphQLFieldConfigMap<any, any>>(
      (prev, field) => {
        const built = field.build();
        const argMap = this.toConfigMap<GraphQLFieldConfigArgumentMap>(
          field.flatArgs,
        );
        delete built.isDeprecated;
        prev[built.name] = {
          ...built,
          args: argMap,
        };
        return prev;
      },
      {},
    );
  }

  transformFields(cb: (field: Field) => void) {
    this.fields.map((field) => {
      cb(field);
    });
    return this;
  }
}
