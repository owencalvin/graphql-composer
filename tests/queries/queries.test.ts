import { ApolloServer, gql } from "apollo-server";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";
import {
  ObjectType,
  InputType,
  Args,
  Request,
  Selection,
  Field,
  Schema,
  InputField,
  Arg,
} from "../../src";

const client = new ApolloClient({
  uri: "http://localhost:4001/graphql",
  fetch,
});

class User {
  Username: string;

  static readonly inputType = InputType.create(User)
    .suffix()
    .addFields(InputField.create("Username", String));
}

class A {
  a: string;
  b: number;
  user: User;

  static resolve(args: any) {
    return true;
  }

  static readonly args = Args.create(A).addArgs(
    Arg.create("a", String),
    Arg.create("b", Number),
    Arg.create("user", User.inputType),
  );

  static readonly args2 = Args.create().addArgs(Arg.create("Username", String));

  static readonly args3 = Args.create().addArgs(
    Arg.create("Username2", String),
  );
}

class Response {
  code: number;

  static readonly objectType = ObjectType.create(Response).addFields(
    Field.create("code", Number),
  );
}

const request = Request.create<any>("query", "A", {
  a: "a",
  b: 0,
  user: { Username: "ven" },
  Username: "hello",
  Username2: "hello3",
}).select(Selection.create<Response>("code"));

const query = ObjectType.create("Query").addFields(
  Field.create("A", Response.objectType).setResolver<any>(
    A.resolve,
    A.args,
    A.args2,
    A.args3,
  ),
);

beforeAll(async () => {
  // const server = new ApolloServer({
  //   schema: Schema.create(query, User.inputType, Response.objectType).build(),
  // });
  // const url = await server.listen(4001);
  // console.log(url);
});

describe("Queries", () => {
  it("Should create a resolver some arguments", async () => {
    // const res = await client.query({
    //   query: gql`
    //     ${request.source}
    //   `,
    // });
  });
});
