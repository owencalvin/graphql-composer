import {
  GraphQLOutputType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInputType,
} from "graphql";
import {
  FieldType,
  DateTime,
  InputFieldType,
  GQLAnyType,
  NullableType,
} from "..";
import { RequiredType, N } from "../definition";

export class TypeParser {
  static parse<ReturnType>(
    type: FieldType | InputFieldType,
    requiredByDefault = false,
    arrayRequired = undefined,
    forceNullable = false,
    forceRequired = false,
  ): ReturnType {
    let finalType: GraphQLOutputType | GraphQLInputType;

    if (Array.isArray(type)) {
      finalType = this.parse(
        type[0],
        requiredByDefault,
        arrayRequired,
        forceNullable,
        arrayRequired === undefined ? requiredByDefault : arrayRequired,
      );
      if (finalType) {
        finalType = GraphQLList(finalType);
      }
    }

    if (type instanceof GQLAnyType) {
      finalType = type.built;
    }

    switch (type) {
      case String:
        finalType = GraphQLString;
        break;
      case Number:
        finalType = GraphQLFloat;
        break;
      case Boolean:
        finalType = GraphQLBoolean;
      case Date:
        finalType = DateTime;
        break;
    }

    if ((requiredByDefault && !forceNullable) || forceRequired) {
      if (type instanceof NullableType) {
        finalType = this.parse(
          type.type,
          requiredByDefault,
          arrayRequired,
          true,
        );
      } else if (type instanceof RequiredType) {
        const t = this.parse(type.type, requiredByDefault, arrayRequired);
        if (t) {
          finalType = GraphQLNonNull(t as any);
        }
      } else if (finalType) {
        finalType = GraphQLNonNull(finalType);
      }
    } else {
      if (type instanceof RequiredType) {
        const t = this.parse(type.type, requiredByDefault, arrayRequired);
        if (t) {
          finalType = GraphQLNonNull(t as any);
        }
      } else if (type instanceof NullableType) {
        finalType = this.parse(type.type, requiredByDefault, arrayRequired);
      }
    }

    return finalType as any;
  }
}
