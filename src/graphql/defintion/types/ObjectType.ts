import { GQLType } from "./GQLType";
import { Field } from "../fields/Field";
import {
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  GraphQLFieldConfigArgumentMap,
} from "graphql";
import { InterfaceType } from "./InterfaceType";
import { TypeConverter, ConversionType } from "../../helpers/TypeConverter";

export class ObjectType extends GQLType<GraphQLObjectType> {
  protected _fields: Field[] = [];
  private _implementations: InterfaceType[] = [];

  get fields() {
    return this._fields;
  }

  get implementations() {
    return this._implementations;
  }

  setImplementations(...implementations: InterfaceType[]) {
    this._implementations = implementations;
    return this;
  }

  addImplementations(...implementations: InterfaceType[]) {
    this.setImplementations(...this._implementations, ...implementations);
    return this;
  }

  removeImplementation(type: InterfaceType) {
    this._implementations.splice(this._implementations.indexOf(type), 1);
    return this;
  }

  static create(name: string) {
    return new ObjectType(name);
  }

  build(): GraphQLObjectType {
    this.preBuild();
    this._fields = [
      ...this._fields,
      ...this._implementations.flatMap((i) => i.fields),
    ];

    const built = new GraphQLObjectType({
      name: this._name,
      description: this.description,
      fields: () => {
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
      },
      interfaces: () => this.implementations.map((i) => i.built),
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
      .setImplementations(...this._implementations)
      .setExtension(this._extension)
      .addFields(...this._fields);
  }

  transformFields(cb: (field: Field) => void) {
    this.applyFieldsTransformation(cb);
    return this;
  }
}
