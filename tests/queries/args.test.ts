import {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLInputObjectType,
} from "graphql";
import {
  InputField,
  InputType,
  Args,
  ObjectType,
  Field,
  Schema,
  Arg,
} from "../../src";

class User {
  Username: string;

  static inputType = InputType.create(User)
    .suffix()
    .addFields(InputField.create("Username", String));
}

class A extends User {
  a: string;
  b: number;
  user: User;

  static resolve() {}

  static args = Args.create(A).addArgs(
    Arg.create("a", String),
    Arg.create("b", Number),
    Arg.create("user", User.inputType),
  );
}

class Z {
  z: string;
}

const user = ObjectType.create("User").addFields(
  Field.create("Email", Number).setResolver(A.resolve, A.args),
  Field.create("Username", Number).setResolver<any>(
    A.resolve,
    Args.create(Z).addArgs(Arg.create("z", String)),
  ),
  Field.create("Role", Number).setResolver(() => {},
  Args.create().addArgs(Arg.create("x", Date))),
);

describe("Args", () => {
  it("Should create a resolver some arguments", async () => {
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
    user.addFields(
      Field.create("Infos", String).setArgs(
        Args.create().addArgs(
          Arg.create("a", infosInput),
          Arg.create("b", String),
        ),
      ),
    );

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
    expect(infosArgs).toHaveLength(2);

    const aArg = infosArgs[0];
    expect(aArg.name).toBe("a");
    expect((aArg.type as GraphQLInputObjectType).name).toBe("Infos");

    const bArg = infosArgs[1];
    expect(bArg.name).toBe("b");
    expect((bArg.type as GraphQLScalarType).name).toBe("String");
    //#endregion
  });
});
