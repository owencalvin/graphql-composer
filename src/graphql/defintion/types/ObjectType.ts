import { Type } from "./Type";
import { ObjectField } from "../fields/ObjectField";
import {
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  GraphQLFieldConfigArgumentMap,
} from "graphql";
import { InterfaceType } from "./InterfaceType";
import { TypeConverter, ConversionType } from "../../helpers/TypeConverter";

export class ObjectType extends Type<GraphQLObjectType> {
  protected _fields: ObjectField[] = [];
  private _implementation?: InterfaceType;

  get fields() {
    return this._fields;
  }

  setImplementation(implementation: InterfaceType) {
    this._implementation = implementation;
    return this;
  }

  static create(name?: string) {
    return new ObjectType(name);
  }

  build(): GraphQLObjectType {
    this.preBuild();
    this._fields = [...this._fields, ...(this._implementation?.fields || [])];

    const builtFields = this.fields.reduce<GraphQLFieldConfigMap<any, any>>(
      (prev, field) => {
        const built = field.build();
        const argMap = this.toConfigMap<GraphQLFieldConfigArgumentMap>(
          field.args,
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

    const built = new GraphQLObjectType({
      name: this._name,
      fields: () => {
        return builtFields;
      },
    });

    this._built = built;

    return built;
  }

  convert<Target extends ConversionType>(to: Target) {
    return TypeConverter.convert<Target>(this, to);
  }

  copy() {
    return ObjectType.create(this.name)
      .setDescription(this._description)
      .setHidden(this._hidden)
      .setImplementation(this._implementation)
      .setExtension(this._extension)
      .addFields(...this._fields);
  }

  transformFields(cb: (field: ObjectField) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }
}
