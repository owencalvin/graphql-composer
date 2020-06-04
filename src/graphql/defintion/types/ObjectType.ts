import { Type } from "./Type";
import { ObjectField } from "../fields/ObjectField";
import {
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  GraphQLFieldConfigArgumentMap,
} from "graphql";
import { InterfaceType } from "./InterfaceType";

export class ObjectType extends Type<GraphQLObjectType> {
  protected _fields: ObjectField[] = [];
  protected _implementation?: InterfaceType;

  get fields() {
    return this._fields;
  }

  setImplementation(implementation: InterfaceType) {
    this._implementation = implementation;
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

    return new GraphQLObjectType({
      name: this._name,
      fields: () => {
        return builtFields;
      },
    });
  }

  private toConfigMap<ReturnType>(
    arr: { name: string; build(): any }[],
  ): ReturnType {
    return arr.reduce<any>((prev, item) => {
      const built = item.build();
      prev[built.name] = {
        ...built,
      };
      return prev;
    }, {});
  }
}
