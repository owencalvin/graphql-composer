import { Field } from "../fields/Field";
import { ArrayHelper, Removable } from "../../helpers/ArrayHelper";
import { GQLType } from "./GQLType";
import { GraphQLFieldConfigMap, GraphQLFieldConfigArgumentMap } from "graphql";
import { ClassType } from "../../../shared/ClassType";
import { FieldType } from "../../types/FieldType";

export abstract class GQLObjectType<
  BuiltType = any,
  T extends ClassType<any> = any
> extends GQLType<BuiltType, T> {
  protected _fields: Field[] = [];

  get fields() {
    return this._fields;
  }

  constructor(name: string) {
    super(name);
  }

  setFields(...fields: Field<keyof InstanceType<T>>[]) {
    this._fields = fields;
    return this;
  }

  addField(name: keyof InstanceType<T>, type: FieldType) {
    return this.setFields(...this._fields, Field.create(name, type));
  }

  addFields(...fields: Field<keyof InstanceType<T>>[]) {
    return this.setFields(...this._fields, ...fields);
  }

  removeFields(...fields: Removable<Field<keyof InstanceType<T>>>) {
    return this.setFields(...ArrayHelper.remove(fields, this._fields));
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

  protected applyFieldsTransformation(cb: (field: Field) => void) {
    return this.fields.map((field) => {
      cb(field);
    });
  }
}
