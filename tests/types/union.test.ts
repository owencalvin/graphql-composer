import {
  GraphQLUnionType,
  GraphQLObjectType,
  GraphQLInterfaceType,
} from "graphql";
import { Schema, ObjectType, UnionType, InterfaceType } from "../../src";

const animal = ObjectType.create("Animal");
const human = ObjectType.create("Human");

const union = UnionType.create("AnimalOrHuman", animal).addTypes(human);

const objectWithUnion = ObjectType.create("ObjectWithUnion").addField(
  "union",
  union,
);

const interfaceWithUnion = InterfaceType.create("InterfaceWithUnion").addField(
  "union",
  union,
);

describe("Enum", () => {
  it("Should create an EnumType based on a real enum", async () => {
    const schema = Schema.create(animal, human, union);
    const built = schema.build();
    const typeMap = built.getTypeMap();

    const unionType = typeMap.AnimalOrHuman as GraphQLUnionType;
    const unionTypes = unionType.getTypes();

    expect(unionTypes).toHaveLength(2);

    expect(unionTypes[0].name).toBe("Animal");

    expect(unionTypes[1].name).toBe("Human");
  });

  it("Should create some types with union field type", async () => {
    const schema = Schema.create(
      animal,
      human,
      union,
      objectWithUnion,
      interfaceWithUnion,
    );

    const built = schema.build();
    const typeMap = built.getTypeMap();

    const objectType = typeMap.ObjectWithUnion as GraphQLObjectType;
    const objectField = objectType.getFields().union;

    const interfaceType = typeMap.InterfaceWithUnion as GraphQLInterfaceType;
    const interfaceField = interfaceType.getFields().union;

    expect((objectField.type as GraphQLUnionType).name).toBe("AnimalOrHuman");

    expect((interfaceField.type as GraphQLUnionType).name).toBe(
      "AnimalOrHuman",
    );
  });
});
