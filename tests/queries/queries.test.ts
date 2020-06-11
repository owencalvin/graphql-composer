import { ApolloServer, gql } from "apollo-server";
import ApolloClient from "apollo-boost";
import fetch from "node-fetch";
import { ObjectType, Args, Field, Schema, Arg } from "../../src";

const client = new ApolloClient({
  uri: "http://localhost:4001/graphql",
  fetch,
});

class User {
  name: string;
  email: string;

  static obj = ObjectType.create("User").addFields(
    Field.create("name", String),
    Field.create("email", String),
  );
}

const chapter = ObjectType.create("Chapter").addFields(
  Field.create("number", Number),
  Field.create("name", String),
);

const res = ObjectType.create("Response").addFields(
  Field.create("name2", String),
  Field.create("email2", String),
  Field.create("User", User.obj),
);

const query = ObjectType.create("Query").addFields(
  Field.create("user", res).setResolver(
    (args, gql, next) => {
      return args;
    },
    Args.create().addArgs(
      Arg.create("name2", String),
      Arg.create("email2", String),
    ),
    Args.create(User).addArgs(
      Arg.create("name", String),
      Arg.create("email", String),
    ),
  ),
  Field.create("chapters", chapter),
);

let server: ApolloServer;

beforeAll(async () => {
  const schema = Schema.create(query, User.obj, chapter, res).build();
  server = new ApolloServer({
    schema,
  });
  await server.listen(4001);
});

afterAll(async () => {
  await server.stop();
});

describe("Queries", () => {
  it("Should create a resolver some arguments", async () => {
    const res = (
      await client.query({
        query: gql`
          query {
            user(
              name: "name"
              email: "email"
              name2: "name2"
              email2: "email2"
            ) {
              User {
                name
                email
              }
              name2
              email2
            }
          }
        `,
      })
    ).data.user;

    expect(res).toEqual({
      __typename: "Response",
      name2: "name2",
      email2: "email2",
      User: {
        __typename: "User",
        name: "name",
        email: "email",
      },
    });
  });
});
