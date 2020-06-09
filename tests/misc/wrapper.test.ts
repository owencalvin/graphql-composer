import {
  GraphQLUnionType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLInputType,
} from "graphql";
import { Schema } from "../../src/defintion/schema/Schema";
import { ObjectType } from "../../src/defintion/types/ObjectType";
import { UnionType } from "../../src/defintion/types/composed/UnionType";
import { InterfaceType } from "../../src/defintion/types/InterfaceType";
import { Wrapper } from "../../src/wrapper/Wrapper";
import { InputType } from "../../src/defintion/types/InputType";

const animal = ObjectType.create("Animal").addField("a", String);
const human = ObjectType.create("Human").addField("b", String);

const union = UnionType.create("AnimalOrHuman", animal).addTypes(human);

const obj = ObjectType.create("Object").addField("union", union);
const interf = InterfaceType.create("Interface").addField("union", union);
const input = InputType.create("Input").addField("input", String);

describe("Wrapper", () => {
  it("Should create a Wrapper", async () => {
    const wrapperA = Wrapper.create(animal, human);
    const wrapperB = Wrapper.create(union);
    const wrapperC = Wrapper.create(obj, interf, input);

    wrapperA
      .transform(ObjectType, (t) => t.setDescription("test"))
      .transformFields(ObjectType, (f) => f.required());

    const schema = Schema.create(wrapperA, wrapperB, wrapperC);

    const built = schema.build();
    const typeMap = built.getTypeMap();

    const objectType = typeMap.Object as GraphQLObjectType;
    const interfaceType = typeMap.Interface as GraphQLInterfaceType;
    const inputType = typeMap.Input as GraphQLInputType;
    const animalType = typeMap.Animal as GraphQLObjectType;
    const humanType = typeMap.Human as GraphQLObjectType;
    const unionType = typeMap.AnimalOrHuman as GraphQLUnionType;

    expect(objectType).toBeDefined();
    expect(interfaceType).toBeDefined();
    expect(inputType).toBeDefined();
    expect(animalType).toBeDefined();
    expect(humanType).toBeDefined();
    expect(unionType).toBeDefined();
  });
});
