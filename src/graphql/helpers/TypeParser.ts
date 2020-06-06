import {
  GraphQLOutputType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInputType,
} from "graphql";
import { FieldType } from "../types/FieldType";
import { NotNullableType } from "../defintion/modifiers/NotNullable";
import { GQLType } from "../defintion/types/GQLType";
import { DateTime } from "../scalars/DateTime";

export class TypeParser {
  static parse<ReturnType>(type: FieldType): ReturnType {
    let finalType: GraphQLOutputType | GraphQLInputType;

    if (Array.isArray(type)) {
      finalType = this.parse(type[0]);
      finalType = GraphQLList(finalType);
    }

    if (type instanceof GQLType) {
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

    if (type instanceof NotNullableType) {
      finalType = GraphQLNonNull(this.parse(type.type));
    }

    return finalType as any;
  }
}
