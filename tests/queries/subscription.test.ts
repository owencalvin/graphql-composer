import { Args, ObjectType, Field, Schema, Arg } from "../../src";
import { ApolloServer, gql } from "apollo-server-express";
import ApolloClient from "apollo-client";
import fetch from "node-fetch";
import { PubSub } from "graphql-subscriptions";
import { createServer } from "http";
import { WebSocketLink } from "apollo-link-ws";
import * as express from "express";
import * as ws from "ws";
import { getMainDefinition } from "apollo-utilities";
import { HttpLink } from "apollo-link-http";
import { split, ApolloLink } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";

const app = express();

const httpLink = new HttpLink({
  fetch,
  uri: "http://localhost:4003/graphql",
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4003/graphql`,
  webSocketImpl: ws,
  options: {
    reconnect: true,
  },
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query) as any;
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink,
);

const link = ApolloLink.from([terminatingLink]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache,
});

const pubsub = new PubSub();

class Response {
  res = "res";

  constructor(res?) {
    if (res) {
      this.res = res;
    }
  }

  static obj = ObjectType.create(Response).addFields(
    Field.create("res", String),
  );
}

const query = ObjectType.create("Query").addFields(
  Field.create("trigger", Response.obj).setResolver((args, ctx) => {
    pubsub.publish(args.notif, { payload: "mypayload" });
    return new Response();
  }, Args.create().addArgs(Arg.create("notif", String))),
);

const subscription = ObjectType.create("Subscription").addFields(
  Field.create("notification", Response.obj)
    .setSubscription((args, ctx) => {
      expect(args).toEqual({ notif: "notif" });
      return pubsub.asyncIterator("NOTIFICATION");
    })
    .setResolver((args, ctx) => {
      expect(args).toEqual({ notif: "NOTIFICATION" });
      return new Response(ctx.source.payload);
    }, Args.create().addArgs(Arg.create("notif", String)))
    .addMiddlewares(async (args, ctx, next) => {
      expect(args).toEqual({ notif: "notif" });
      args.notif = "NOTIFICATION";
      await next();
    }),
);

const schema = Schema.create(Response.obj, query, subscription).build();

const server = new ApolloServer({
  schema,
  introspection: false,
  playground: false,
});

describe("Subscription", () => {
  it("Should create a subscription", async (done) => {
    // eslint-disable-next-line prefer-const
    let loop: any;
    server.applyMiddleware({ app, path: "/graphql" });

    const httpServer = createServer(app);
    server.installSubscriptionHandlers(httpServer);

    await new Promise((resolve) => {
      httpServer.listen({ port: 4003 }, () => {
        resolve();
      });
    });

    let res = await client.subscribe({
      query: gql`
        subscription {
          notification(notif: "notif") {
            res
          }
        }
      `,
    });

    res.subscribe(async (value) => {
      expect(value).toEqual({
        data: {
          notification: { __typename: "Response", res: "mypayload" },
        },
      });
      await server.stop();
      await new Promise((resolve) => {
        httpServer.close(() => {
          resolve();
        });
      });
      clearInterval(loop);
      res = undefined;
      done();
      process.exit();
    });

    loop = setInterval(async () => {
      await client.query({
        query: gql`
          query {
            trigger(notif: "NOTIFICATION") {
              res
            }
          }
        `,
      });
    }, 100);
  }, 0);
});
