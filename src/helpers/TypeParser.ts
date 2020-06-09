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
  NotNullableType,
  DateTime,
  InputFieldType,
  GQLAnyType,
} from "..";

export class TypeParser {
  static parse<ReturnType>(type: FieldType | InputFieldType): ReturnType {
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

    if (type instanceof NotNullableType) {
      finalType = GraphQLNonNull(this.parse(type.type));
    }

    return finalType as any;
  }
}
