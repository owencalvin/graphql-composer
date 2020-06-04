import { Schema } from "../src/graphql/defintion/schema/Schema";
import { ObjectType } from "../src/graphql/defintion/types/ObjectType";
import { InputType } from "../src/graphql/defintion/types/InputType";
import { ObjectField } from "../src/graphql/defintion/fields/ObjectField";
import { NotNullable } from "../src/graphql/defintion/modifiers/NotNullable";
import { Arg } from "../src/graphql/defintion/fields/Arg";
import { Type } from "../src/graphql/defintion/types/Type";

describe("Create schema", () => {
  it("Should create a simple schema", async () => {
    const user = ObjectType.create("User").addFields(
      ObjectField.create("Username", NotNullable([String])),
      ObjectField.create("getName", String).setResolve(
        (_) => null,
        Arg.create("test", String),
        Arg.create("test2", String),
      ),
    );

    const chapter = ObjectType.create("Chapter").addFields(
      ObjectField.create("User", user),
    );

    const userInput = user.convert(InputType).setName("UserInput");

    const schema = Schema.create().addTypes(user, chapter, userInput);

    const built = schema.build();
    console.log(built);
  });
});
