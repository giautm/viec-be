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

import { Schema } from './schema';
import resolvers from './resolvers';
import { pubsub } from './pubsub';
import { logger } from '../logger';

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

const initContext = async (user) => {
  return Promise.resolve({
    user,
  });
}

export const graphQLSettings = async (ctx) => {
  const user = {};

  return {
    schema: executableSchema,
    context: await initContext(user),
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
        const user = {};
        return await initContext(user);
       }

       throw new Error('Missing auth token!');
    },
  }, socketOptions);
};
