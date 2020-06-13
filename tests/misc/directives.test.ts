import { ObjectType, Field, Schema, Directive } from "../../src";
import { GraphQLObjectType } from "graphql";

const user = ObjectType.create("User").addFields(
  Field.create("name", String).addDirectives(
    Directive.create("MyDir").addArg("dir", "a"),
  ),
);

const schema = Schema.create(user);

const built = schema.build();

describe("Wrapper", () => {
  it("Should create a Wrapper", async () => {
    const field = (built.getTypeMap().User as GraphQLObjectType).getFields()
      .name;

    expect(field.name).toBe("name");
    expect(field.astNode.directives[0].name.value).toBe("MyDir");
    expect(field.astNode.directives[0].arguments[0].name.value).toBe("dir");
    expect((field.astNode.directives[0].arguments[0].value as any).value).toBe(
      "a",
    );
  });
});
