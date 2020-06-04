import { Schema } from "../src/graphql/defintion/schema/Schema";
import { ObjectType } from "../src/graphql/defintion/types/ObjectType";
import { ObjectField } from "../src/graphql/defintion/fields/ObjectField";

describe("Create schema", () => {
  it("Should create a simple schema", async () => {
    const schema = Schema.create().addTypes(
      ObjectType.create("User").addFields(
        ObjectField.create("Username", String),
      ),
    );

    schema.build();
    console.log(schema);
  });
});
