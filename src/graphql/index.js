import Raven from 'raven';
import uuid from 'uuid';
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';
import {
  IsUserError,
  maskErrors,
} from 'graphql-errors';
import { SubscriptionManager } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import jwt from 'jsonwebtoken';

import { Schema } from './schema';
import resolvers from './resolvers';
import { pubsub } from './pubsub';
import { logger } from '../logger';
import {
  User,
} from '../mongodb';

const TOKEN_SECRET = process.env.AUTH0_CLIENT_SECRET;

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: resolvers(),
});

maskErrors(executableSchema, (error) => {
  error.errorId = uuid.v4();
  Raven.captureException(error, (err, eventId) => {
    logger.error(`Reported error ${error.errorId} with event ${eventId}\n`, error);
  });

  if (error[IsUserError] !== true) {
    return Object.assign({}, error, {
      message: `Internal Error: ${error.errorId}`,
    });
  }

  return error;
});

const initContext = async (authToken) => {
  try {
    let user = null;
    if (authToken) {
      try {
        const payload = jwt.verify(authToken, TOKEN_SECRET);
        if (payload && payload.sub) {
          user = await User.findOne({ userId: payload.sub });
        }
      } catch(err) {
      }
    }
    // Do other tasks: Init Dataloader.

    return {
      user,
    };
  } catch(err) {
    Raven.captureException(err);
    throw err;
  }
};

export const graphQLSettings = async (ctx) => {
  // Extract jwt from request header
  let [schema, token] = ctx.request.get('Authorization').split(' ');
  if (token && schema.toLowerCase() === 'bearer') {
    token = null;
  }

  return {
    schema: executableSchema,
    context: await initContext(token),
  };
};

export const graphQLSubscriptions = (socketOptions) => {
  return new SubscriptionServer({
    subscriptionManager: new SubscriptionManager({
      schema: executableSchema,
      pubsub: pubsub,
    }),
    onConnect: async (connectionParams, webSocket) => {
      console.log(connectionParams);
      const { authToken } = connectionParams;
      if (authToken) {
        return await initContext(authToken);
      }

      throw new Error('Missing auth token!');
    },
  }, socketOptions);
};
