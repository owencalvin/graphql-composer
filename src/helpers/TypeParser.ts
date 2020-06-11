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
import { RequiredType } from "../definition";

export class TypeParser {
  static parse<ReturnType>(
    type: FieldType | InputFieldType,
    notNullableByDefault = false,
  ): ReturnType {
    let finalType: GraphQLOutputType | GraphQLInputType;

    if (Array.isArray(type)) {
      finalType = this.parse(type[0]);
      finalType = GraphQLList(finalType);
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

    if (notNullableByDefault) {
      if (type instanceof NullableType) {
        finalType = this.parse(type.type);
      } else {
        finalType = GraphQLNonNull(finalType);
      }
    } else {
      if (type instanceof RequiredType) {
        finalType = GraphQLNonNull(this.parse(type.type));
      }
    }

    return finalType as any;
  }
}
