import {
  ObjectType,
  Field,
  Schema,
  Directive,
  DirectiveDefinition,
} from "../../src";
import {
  GraphQLObjectType,
  GraphQLField,
  GraphQLEnumValue,
  printSchema,
} from "graphql";
import { SchemaDirectiveVisitor } from "apollo-server";

const user = ObjectType.create("User").addFields(
  Field.create("name", String).addDirectives(
    Directive.create("upper").addArg("arg", 1),
  ),
);

const schema = Schema.create(user);

const built = schema.build();

describe("Directive", () => {
  it("Should create a directive", async () => {
    const field = (built.getTypeMap().User as GraphQLObjectType).getFields()
      .name;

    expect(field.name).toBe("name");
    expect(field.astNode.directives[0].name.value).toBe("upper");
    expect(field.astNode.directives[0].arguments[0].name.value).toBe("arg");
    expect((field.astNode.directives[0].arguments[0].value as any).value).toBe(
      "1",
    );
  });

  it("Should work with apollo", () => {
    class UpDirective extends SchemaDirectiveVisitor {
      public visitFieldDefinition(field: GraphQLField<any, any>) {
        expect(field.name).toBe("name");
        expect(this.name).toBe("upper");
        expect(this.args).toEqual({ arg: 1 });
      }
    }

    SchemaDirectiveVisitor.visitSchemaDirectives(built, {
      upper: UpDirective,
    });
  });
});
