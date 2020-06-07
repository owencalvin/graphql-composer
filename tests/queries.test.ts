import {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLInputObjectType,
} from "graphql";
import { InputField } from "../src/graphql/defintion/fields/InputField";
import { ObjectType } from "../src/graphql/defintion/types/ObjectType";
import { InputType } from "../src/graphql/defintion/types/InputType";
import { Schema } from "../src/graphql/defintion/schema/Schema";
import { Field } from "../src/graphql/defintion/fields/Field";
import { Args } from "../src/graphql/defintion/fields/Args";
import { Arg } from "../src/graphql/defintion/fields/Arg";

class User {
  Username: string;

  static inputType = InputType.create(User)
    .suffix()
    .addField("Username", String);
}

class A {
  a: string;
  b: number;
  user: User;

  static resolve() {}

  static args = Args.create(A)
    .addArg("a", String)
    .addArg("b", Number)
    .addArg("user", User.inputType);
}

interface Z {
  z: string;
}

const user = ObjectType.create("User").addFields(
  Field.create("Email", Number).setResolver(A.resolve, A.args),
  Field.create("Username", Number).setResolver<Z>(
    A.resolve,
    Arg.create("z", String),
  ),
  Field.create("Role", Number).setResolver(() => {}, Arg.create("x", Date)),
);

describe("Queries", () => {
  it("Should create a resolver with a mixed resolver definition", async () => {
    const schema = Schema.create(user, User.inputType);
    const built = schema.build();
    const typeMap = built.getTypeMap();

    const userType = typeMap.User as GraphQLObjectType;
    const userFields = userType.getFields();

    //#region Email field
    const emailArgs = userFields.Email.args;
    expect(emailArgs).toHaveLength(3);

    const aField = emailArgs[0];
    expect(aField.name).toBe("a");
    expect((aField.type as GraphQLScalarType).name).toBe("String");

    const bField = emailArgs[1];
    expect(bField.name).toBe("b");
    expect((bField.type as GraphQLScalarType).name).toBe("Float");

    const userField = emailArgs[2];
    expect(userField.name).toBe("user");
    expect((userField.type as GraphQLInputObjectType).name).toBe("UserInput");
    //#endregion

    //#region Username field
    const usernameArgs = userFields.Username.args;
    expect(usernameArgs).toHaveLength(1);

    const zField = usernameArgs[0];
    expect(zField.name).toBe("z");
    expect((zField.type as GraphQLScalarType).name).toBe("String");
    //#endregion

    //#region Role field
    const roleArgs = userFields.Role.args;
    expect(roleArgs).toHaveLength(1);

    const xField = roleArgs[0];
    expect(xField.name).toBe("x");
    expect((xField.type as GraphQLScalarType).name).toBe("DateTime");
    //#endregion
  });

  it("Should create arguments with input types", async () => {
    const infosInput = InputType.create("Infos").addFields(
      InputField.create("meta", String),
    );
    user.addFields(Field.create("Infos", String).addArg("a", infosInput));

    const schema = Schema.create(user, infosInput);
    const built = schema.build();
    const typeMap = built.getTypeMap();

    const userType = typeMap.User as GraphQLObjectType;
    const infosType = typeMap.Infos as GraphQLObjectType;
    const userFields = userType.getFields();
    const infosFields = infosType.getFields();

    //#region Infos type
    const metaField = infosFields.meta;

    expect(metaField.name).toBe("meta");
    expect((metaField.type as GraphQLScalarType).name).toBe("String");
    //#endregion

    //#region Infos field
    const infosArgs = userFields.Infos.args;
    expect(infosArgs).toHaveLength(1);

    const aArg = infosArgs[0];
    expect(aArg.name).toBe("a");
    expect((aArg.type as GraphQLInputObjectType).name).toBe("Infos");
    //#endregion
  });
});
