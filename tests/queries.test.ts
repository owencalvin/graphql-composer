import { Schema } from "../src/graphql/defintion/schema/Schema";
import { ObjectType } from "../src/graphql/defintion/types/ObjectType";
import { Field } from "../src/graphql/defintion/fields/Field";
import { Args } from "../src/graphql/defintion/fields/Args";
import { Resolver } from "../src/graphql/types/Resolver";
import { Next } from "../src/graphql/types/Next";
import { KeyValue } from "../src/shared/KeyValue";
import { Arg } from "../src/graphql/defintion/fields/Arg";
import { GraphQLObjectType, GraphQLScalarType } from "graphql";

class A implements Resolver<A> {
  a: string;
  b: number;

  resolve(args: A, gql: any, next: Next, nextArgs: KeyValue) {}

  getArgs() {
    return Args.create(A).addArg("a", String).addArg("b", Number);
  }
}

describe("Queries", () => {
  it("Should create a resolver with a class based resolver", async () => {
    const user = ObjectType.create("User").addFields(
      Field.create("Email", Number).setResolver(A),
      Field.create("Username", Number).setResolver(A, Arg.create("z", String)),
      Field.create("Role", Number).setResolve((a, gql, next, params) => {},
      Arg.create("x", Date)),
    );

    const schema = Schema.create(user);
    const built = schema.build();
    const typeMap = built.getTypeMap();

    const userType = typeMap.User as GraphQLObjectType;
    const userFields = userType.getFields();

    //#region Email field
    const emailArgs = userFields.Email.args;
    expect(emailArgs).toHaveLength(2);

    const aField = emailArgs[0];
    expect(aField.name).toBe("a");
    expect((aField.type as GraphQLScalarType).name).toBe("String");

    const bField = emailArgs[1];
    expect(bField.name).toBe("b");
    expect((bField.type as GraphQLScalarType).name).toBe("Float");
    //#endregion

    //#region Username field
    const usernameArgs = userFields.Username.args;
    expect(usernameArgs).toHaveLength(1);

    const zField = usernameArgs[0];
    expect(zField.name).toBe("z");
    expect((zField.type as GraphQLScalarType).name).toBe("String");
    //#endregion

    //#region Role field
    const roleArgs = userFields.Role.args;
    expect(roleArgs).toHaveLength(1);

    const xField = roleArgs[0];
    expect(xField.name).toBe("x");
    expect((xField.type as GraphQLScalarType).name).toBe("DateTime");
    //#endregion
  });
});
