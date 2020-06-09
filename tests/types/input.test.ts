/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
} from "graphql";
import {
  InterfaceType,
  Field,
  InputType,
  InputField,
  NotNullable,
  Schema,
  ObjectType,
} from "../../src";

const userInterface = InterfaceType.create("UserInterface").addFields(
  Field.create("createdAt", Number),
);

const user = InputType.create("User").addFields(
  InputField.create("Username", NotNullable([String])),
  InputField.create("Email", Number),
);

const role = InputType.create("Role").addFields(
  InputField.create("User", user),
);

describe("InputType", () => {
  it("Should create a simple input type", async () => {
    const schema = Schema.create(user);

    const built = schema.build();

    const typeMap = built.getTypeMap();
    const userType = typeMap.User as GraphQLObjectType;
    const userFields = userType.getFields();

    const usernameType = userFields.Username.type as GraphQLNonNull<
      GraphQLList<GraphQLScalarType>
    >;

    expect(usernameType).toBeInstanceOf(GraphQLNonNull);
    expect(usernameType.ofType).toBeInstanceOf(GraphQLList);
    expect(usernameType.ofType.ofType.name).toBe("String");
    expect((userFields.Email.type as GraphQLScalarType).name).toBe("Float");
  });

  it("Should create a simple type with relation", async () => {
    const schema = Schema.create(user, role);

    const built = schema.build();

    const typeMap = built.getTypeMap();
    const roleType = typeMap.Role as GraphQLObjectType;
    const roleFields = roleType.getFields();

    const usernameType: any = roleFields.User;

    expect(usernameType.name).toBe("User");
  });

  it("Should create a simple type with circular dependency", async () => {
    const a = InputType.create("a");
    const b = InputType.create("b");

    a.addFields(InputField.create("b", b));
    b.addFields(InputField.create("a", a));

    const schema = Schema.create(a, b);

    const built = schema.build();

    const typeMap = built.getTypeMap();
    const aType = typeMap.a as GraphQLInputObjectType;
    const bType = typeMap.b as GraphQLInputObjectType;

    expect((aType.getFields().b.type as GraphQLInputObjectType).name).toBe("b");
    expect((bType.getFields().a.type as GraphQLInputObjectType).name).toBe("a");
  });

  it("Should create a copy and remove fields", async () => {
    const userCopy = user.copy().setName("UserCopy").removeFields("Username");

    const schema = Schema.create(userCopy, user);

    const built = schema.build();

    const typeMap = built.getTypeMap();
    const userCopyType = typeMap.UserCopy as GraphQLInputObjectType;
    const userType = typeMap.User as GraphQLInputObjectType;

    const userCopyFields = userCopyType.getFields();
    const userFields = userType.getFields();

    expect(Object.keys(userCopyFields)).toHaveLength(1);
    expect(Object.keys(userFields)).toHaveLength(2);

    expect(userCopyFields.Email.name).toBe("Email");

    expect(userFields.Username.name).toBe("Username");
    expect(userFields.Email.name).toBe("Email");
  });

  it("Should create converted type", async () => {
    const userObject = user
      .convert(ObjectType)
      .setName("UserObject")
      .removeFields("Username");

    const userInterface = user
      .convert(InterfaceType)
      .setName("UserInterface")
      .removeFields("Email");

    const schema = Schema.create(userObject, userInterface, user);

    const built = schema.build();

    const typeMap = built.getTypeMap();

    expect(typeMap.UserInterface).toBeInstanceOf(GraphQLInterfaceType);
    expect(typeMap.UserObject).toBeInstanceOf(GraphQLObjectType);
    expect(typeMap.User).toBeInstanceOf(GraphQLInputObjectType);

    const userInterfaceType = typeMap.UserInterface as GraphQLInterfaceType;
    const userObjectType = typeMap.UserObject as GraphQLObjectType;
    const userType = typeMap.User as GraphQLInputObjectType;

    const userInterfaceFields = userInterfaceType.getFields();
    const userInputFields = userObjectType.getFields();
    const userFields = userType.getFields();

    expect(Object.keys(userInterfaceFields)).toHaveLength(1);
    expect(Object.keys(userInputFields)).toHaveLength(1);
    expect(Object.keys(userFields)).toHaveLength(2);

    expect(userInterfaceFields.Username.name).toBe("Username");

    expect(userInputFields.Email.name).toBe("Email");

    expect(userFields.Username.name).toBe("Username");
    expect(userFields.Email.name).toBe("Email");
  });
});
