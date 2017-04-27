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

import { Schema } from './schema';
import Resolvers from './resolvers';

const graphqlSettingsPerReq = async (ctx) => {
  const executableSchema = makeExecutableSchema({
    typeDefs: Schema,
    resolvers: Resolvers.call(ctx),
  });

  maskErrors(executableSchema, (error) => {
    error.errorId = uuid.v4();
    Raven.captureException(error, (err, eventId) => {
      ctx.logger.error(`Reported error ${error.errorId} with event ${eventId}\n`, error);
    });
    if (error[IsUserError] !== true) {
      return Object.assign({}, error, {
        message: `Internal Error: ${error.errorId}`,
      });
    }

    return error;
  });

  return {
    schema: executableSchema,
    context: {
      koaContext: ctx,
    },
  };
};

export default graphqlSettingsPerReq;
