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
  connectDatabase,
  User,
} from '../mongodb';

const DOCKER_DB = process.env.MONGODB_PORT; // This is name of docker and posfix `_PORT`
const MONGODB_URI = DOCKER_DB
  ? DOCKER_DB.replace('tcp', 'mongodb') + '/myapp'
  : process.env.MONGODB_URI;

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
    const mongodb = await connectDatabase(MONGODB_URI);
    let user = null;
    try {
      const payload = jwt.verify(authToken, TOKEN_SECRET);
      if (payload && payload.sub) {
        user = await User.findOne({ userId: payload.sub });
      }
    } catch(err) {
    }
    // Do other tasks: Init Dataloader.

    return {
      mongodb,
      user,
    };
  } catch(err) {
    Raven.captureException(err);
    throw err;
  }
};

export const graphQLSettings = async (ctx) => {
  // Extract jwt from request header
  let [schema, token] = ctx.request.get('auth').split(' ');
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
