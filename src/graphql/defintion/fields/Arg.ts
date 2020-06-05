import { Field } from "./Field";
import { GraphQLArgument } from "graphql";
import { TypeParser } from "../../helpers/TypeParser";
import { FieldType } from "../../types/FieldType";
import { ClassType } from "../../../shared/ClassType";
import { ClassDescriptor } from "../../helpers/ClassDescriptor";
import { NotNullable } from "../modifiers/NotNullable";

export class Arg extends Field<GraphQLArgument> {
  protected _defaultValue: string | number | boolean;

  protected constructor(name: string, type: FieldType) {
    super(name, type);
  }

  static create<T extends ClassType<any>>(
    classType: T,
    notNullable?: string[],
  ): Arg[];
  static create(name: string, type: FieldType): Arg;
  static create<T extends ClassType<any>>(
    nameOrClass: string | T,
    typeOrNotNullable?: FieldType | string[],
  ): Arg | Arg[] {
    if (typeof nameOrClass === "string") {
      return new Arg(nameOrClass, typeOrNotNullable as FieldType);
    } else {
      return ClassDescriptor.describe(nameOrClass).map((description) => {
        const notNullable = (typeOrNotNullable as string[]) || [];
        const arg = Arg.create(
          description.property,
          description.type as FieldType,
        );

        if (notNullable.includes(description.property)) {
          arg.setType(NotNullable(arg.type));
        }

        return arg;
      });
    }
  }

  build(): GraphQLArgument {
    return {
      name: this._name,
      type: TypeParser.parse(this._type),
      description: this._description,
      defaultValue: this._defaultValue,
      astNode: undefined,
      extensions: [],
    };
  }
}
