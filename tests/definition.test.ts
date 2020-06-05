import { Schema } from "../src/graphql/defintion/schema/Schema";
import { ObjectType } from "../src/graphql/defintion/types/ObjectType";
import { Field } from "../src/graphql/defintion/fields/Field";
import { NotNullable } from "../src/graphql/defintion/modifiers/NotNullable";
import {
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLList,
} from "graphql";
import { InterfaceType } from "../src/graphql/defintion/types/InterfaceType";

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
    expect(usernameType.ofType.ofType.name === "String");
    expect((userFields.Email.type as GraphQLScalarType).name === "String");
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
    const userCopy = user.copy().setImplementations(userInterface);
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
});
