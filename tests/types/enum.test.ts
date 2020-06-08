import { GraphQLEnumType } from "graphql";
import { Schema } from "../../src/graphql/defintion/schema/Schema";
import { EnumType } from "../../src/graphql/defintion/types/composed/enum/EnumType";
import { EnumValue } from "../../src/graphql/defintion/types/composed/enum/EnumValue";

enum Roles {
  admin = "ADMIN",
  default = "DEFAULT",
}

const animalsEnum = EnumType.create("Animals")
  .addValue("cat", "CAT")
  .addValues(EnumValue.create("cow", "COW"));

const rolesEnum = EnumType.create("Roles", Roles);

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
});
