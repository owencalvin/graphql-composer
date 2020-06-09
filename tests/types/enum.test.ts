import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLInputObjectType,
  GraphQLField,
} from "graphql";
import { Schema } from "../../src/defintion/schema/Schema";
import { EnumType } from "../../src/defintion/types/composed/enum/EnumType";
import { EnumValue } from "../../src/defintion/types/composed/enum/EnumValue";
import { ObjectType } from "../../src/defintion/types/ObjectType";
import { Field } from "../../src/defintion/fields/Field";
import { Args } from "../../src/defintion/types/Args";

enum Roles {
  admin = "ADMIN",
  default = "DEFAULT",
}

const animalsEnum = EnumType.create("Animals")
  .addValue("cat", "CAT")
  .addValues(EnumValue.create("cow", "COW"));

const rolesEnum = EnumType.create("Roles", Roles);

const objectWithEnum = ObjectType.create("ObjectWithEnum")
  .addField("role", rolesEnum)
  .addFields(Field.create("animal", animalsEnum))
  .addFields(
    Field.create("query", String).setArgs(Args.create("enumArg", rolesEnum)),
  );

const interfaceWithEnum = ObjectType.create("InterfaceWithEnum")
  .addField("role", rolesEnum)
  .addFields(Field.create("animal", animalsEnum));

const inputWithEnum = ObjectType.create("InputWithEnum")
  .addField("role", rolesEnum)
  .addFields(Field.create("animal", animalsEnum));

describe("Enum", () => {
  it("Should create an EnumType", async () => {
    const schema = Schema.create(animalsEnum);
    const built = schema.build();
    const typeMap = built.getTypeMap();

    const animalsType = typeMap.Animals as GraphQLEnumType;
    const animalsValues = animalsType.getValues();

    expect(animalsValues).toHaveLength(2);

    expect(animalsValues[0].name).toBe("cat");
    expect(animalsValues[0].value).toBe("CAT");

    expect(animalsValues[1].name).toBe("cow");
    expect(animalsValues[1].value).toBe("COW");
  });

  it("Should create an EnumType based on a real enum", async () => {
    const schema = Schema.create(rolesEnum);
    const built = schema.build();
    const typeMap = built.getTypeMap();

    const rolesType = typeMap.Roles as GraphQLEnumType;
    const rolesValues = rolesType.getValues();

    expect(rolesValues).toHaveLength(2);

    expect(rolesValues[0].name).toBe("admin");
    expect(rolesValues[0].value).toBe("ADMIN");

    expect(rolesValues[1].name).toBe("default");
    expect(rolesValues[1].value).toBe("DEFAULT");
  });

  it("Should create some types with enum", async () => {
    const schema = Schema.create(
      objectWithEnum,
      interfaceWithEnum,
      inputWithEnum,
    );
    const built = schema.build();
    const typeMap = built.getTypeMap();

    const objectType = typeMap.ObjectWithEnum as GraphQLObjectType;
    const inputType = typeMap.InputWithEnum as GraphQLInputObjectType;
    const interfaceType = typeMap.InterfaceWithEnum as GraphQLInterfaceType;

    const inputFields = inputType.getFields();
    const objectFields = objectType.getFields();
    const interfaceFields = interfaceType.getFields();

    expect((objectFields.role.type as GraphQLEnumType).name).toBe("Roles");
    expect((objectFields.animal.type as GraphQLEnumType).name).toBe("Animals");
    expect(
      ((objectFields.query as GraphQLField<any, any, any>).args[0]
        .type as GraphQLEnumType).name,
    ).toBe("Roles");

    expect((inputFields.role.type as GraphQLEnumType).name).toBe("Roles");
    expect((inputFields.animal.type as GraphQLEnumType).name).toBe("Animals");

    expect((interfaceFields.role.type as GraphQLEnumType).name).toBe("Roles");
    expect((interfaceFields.animal.type as GraphQLEnumType).name).toBe(
      "Animals",
    );
  });
});
