import { GraphQLFieldConfigMap, GraphQLFieldConfigArgumentMap } from "graphql";
import {
  Field,
  ClassType,
  StringKeyOf,
  InstanceOf,
  FieldType,
  Removable,
  ArrayHelper,
  Args,
} from "../../../..";
import { GQLType } from "../GQLType";
import { ResolveFunction, KeyValue } from "../../../../types";

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

  /**
   * Add a single field to the fields list
   * @param name The field name
   * @param type The field type
   */
  addField<ReturnType = any, ArgType = KeyValue>(
    name: StringKeyOf<InstanceOf<T>>,
    type: FieldType,
    resolver?: ResolveFunction<ReturnType, ArgType>,
    args?: Args<ClassType<ArgType>>,
  ) {
    return this.setFields(
      ...this._fields,
      Field.create(name, type).setResolver(resolver, args),
    );
  }

  setFields(...fields: Field<StringKeyOf<InstanceOf<T>>>[]) {
    this._fields = fields;
    return this;
  }

  addFields(...fields: Field<StringKeyOf<InstanceOf<T>>>[]) {
    return this.setFields(...this._fields, ...fields);
  }

  removeFields(...fields: Removable<Field<StringKeyOf<InstanceOf<T>>>>) {
    return this.setFields(...ArrayHelper.remove(fields, this._fields));
  }

  transformFields(cb: (field: Field) => void) {
    this.fields.map((field) => {
      cb(field);
    });
    return this;
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
}
