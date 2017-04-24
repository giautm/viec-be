import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-bodyparser';
import {
  graphqlKoa,
} from 'graphql-server-koa';

import logger from './logger';
import schema from './schema';

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

  const { user } = await getUser(req.header.authorization);

  return {
    graphiql: process.env.NODE_ENV !== 'production',
    schema,
    context: {
      user,
      ctx,
    },
    formatError: (error) => {
      console.log(error.message);
      console.log(error.locations);
      console.log(error.stack);
      return {
        message: error.message,
        locations: error.locations,
        stack: error.stack,
      };
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
