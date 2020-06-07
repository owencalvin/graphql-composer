import {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
} from "graphql";
import { NotNullable } from "../src/graphql/defintion/modifiers/NotNullable";
import { InterfaceType } from "../src/graphql/defintion/types/InterfaceType";
import { ObjectType } from "../src/graphql/defintion/types/ObjectType";
import { InputType } from "../src/graphql/defintion/types/InputType";
import { Schema } from "../src/graphql/defintion/schema/Schema";
import { Field } from "../src/graphql/defintion/fields/Field";

const userInterface = InterfaceType.create("UserInterface").addFields(
  Field.create("createdAt", Number),
);

const user = ObjectType.create("User").addFields(
  Field.create("Username", NotNullable([String])),
  Field.create("Email", Number),
);

const role = ObjectType.create("Role").addFields(Field.create("User", user));

describe("ObjectType", () => {
  it("Should create a simple type", async () => {
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

  it("Should create a simple type with implementation", async () => {
    const userCopy = user.copy().setInterfaces(userInterface);
    const schema = Schema.create(userInterface, userCopy);

    const built = schema.build();

    const typeMap = built.getTypeMap();
    const roleType = typeMap.User as GraphQLObjectType;
    const roleInterfaces = roleType.getInterfaces();

    expect(roleInterfaces[0].name).toBe("UserInterface");
  });

  it("Should create a simple type with circular dependency", async () => {
    const a = ObjectType.create("a");
    const b = ObjectType.create("b");

    a.addFields(Field.create("b", b));
    b.addFields(Field.create("a", a));

    const schema = Schema.create(a, b);

    const built = schema.build();

    const typeMap = built.getTypeMap();
    const aType = typeMap.a as GraphQLObjectType;
    const bType = typeMap.b as GraphQLObjectType;

    expect((aType.getFields().b.type as GraphQLObjectType).name).toBe("b");
    expect((bType.getFields().a.type as GraphQLObjectType).name).toBe("a");
  });

  it("Should create a copy", async () => {
    const userCopy = user.copy().setName("UserCopy").removeFields("Username");

    const schema = Schema.create(userCopy, user);

    const built = schema.build();

    const typeMap = built.getTypeMap();
    const userCopyType = typeMap.UserCopy as GraphQLObjectType;
    const userType = typeMap.User as GraphQLObjectType;

    const userCopyFields = userCopyType.getFields();
    const userFields = userType.getFields();

    expect(Object.keys(userCopyFields)).toHaveLength(1);
    expect(Object.keys(userFields)).toHaveLength(2);

    expect(userCopyFields.Email.name).toBe("Email");

    expect(userFields.Username.name).toBe("Username");
    expect(userFields.Email.name).toBe("Email");
  });

  it("Should create converted type and remove a field", async () => {
    const userInput = user
      .convert(InputType)
      .setName("UserInput")
      .removeFields("Username");

    const userInterface = user
      .convert(InterfaceType)
      .setName("UserInterface")
      .removeFields("Email");

    const schema = Schema.create(userInterface, userInput, user);

    const built = schema.build();

    const typeMap = built.getTypeMap();

    expect(typeMap.UserInterface).toBeInstanceOf(GraphQLInterfaceType);
    expect(typeMap.UserInput).toBeInstanceOf(GraphQLInputObjectType);
    expect(typeMap.User).toBeInstanceOf(GraphQLObjectType);

    const userInterfaceType = typeMap.UserInterface as GraphQLInterfaceType;
    const userInputType = typeMap.UserInput as GraphQLInputObjectType;
    const userType = typeMap.User as GraphQLObjectType;

    const userInterfaceFields = userInterfaceType.getFields();
    const userInputFields = userInputType.getFields();
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
