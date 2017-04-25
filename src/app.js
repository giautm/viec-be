import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-bodyparser';
import {
  graphqlKoa,
} from 'graphql-server-koa';
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import logger from './logger';
import { Schema } from './schema';
import Resolvers from './resolvers';

const app = new Koa();

app.use(logger());

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  ctx.logger.info(`${ctx.method} ${ctx.url} - ${ms} ms`);
});

// koaBody is needed just for POST.
app.use(koaBody());

const graphqlSettingsPerReq = async (ctx) => {
  const executableSchema = makeExecutableSchema({
    typeDefs: Schema,
    resolvers: Resolvers.call(ctx),
  });

  return {
    schema: executableSchema,
    context: {
      koaContext: ctx,
    },
  };
};

const router = new KoaRouter();
router.post('/graphql', graphqlKoa(graphqlSettingsPerReq));
router.get('/graphql', graphqlKoa(graphqlSettingsPerReq));

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', (err, ctx) => {
  ctx.logger.error(error);
});
export default app;
