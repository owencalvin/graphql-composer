import { Schema } from "../src/graphql/defintion/schema/Schema";
import { ObjectType } from "../src/graphql/defintion/types/ObjectType";
import { InputType } from "../src/graphql/defintion/types/InputType";
import { EnumType } from "../src/graphql/defintion/types/composed/enum/EnumType";
import { UnionType } from "../src/graphql/defintion/types/composed/UnionType";
import { ObjectField } from "../src/graphql/defintion/fields/ObjectField";
import { NotNullable } from "../src/graphql/defintion/modifiers/NotNullable";
import { Arg } from "../src/graphql/defintion/fields/Arg";
import { EnumValue } from "../src/graphql/defintion/types/composed/enum/EnumValue";

class A {
  t: String[][] = [[""]];
}

describe("Create schema", () => {
  it("Should create a simple schema", async () => {
    const user = ObjectType.create("User").addFields(
      ObjectField.create("Username", NotNullable([String])),
      ObjectField.create("getName", String).setResolve<A>(
        () => null,
        Arg.create("test", String),
        Arg.create("test2", String),
        Arg.create(A),
      ),
    );

    const chapter = ObjectType.create("Chapter").addFields(
      ObjectField.create("User", user),
    );

    const userInput = user.convert(InputType).setName("UserInput");

    const testEnum = EnumType.create("TestEnum").addValues(
      EnumValue.create("a", 1),
      EnumValue.create("b", 2),
    );

    const testUnion = UnionType.create("TestUnion").addTypes(chapter, user);

    const schema = Schema.create().addTypes(
      user,
      chapter,
      userInput,
      testEnum,
      testUnion,
    );

    const built = schema.build();
    console.log(built);
  });
});
