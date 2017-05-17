import Koa from 'koa';
import KoaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import {
  graphqlKoa,
} from 'graphql-server-koa';
import Raven from 'raven';

import { logger } from './logger';
import {
  graphQLSettings,
  graphQLSubscriptions,
} from './graphql';

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.logger = logger;
  await next();
});
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  const { response } = ctx;
  ctx.logger.info(`${ctx.method} ${ctx.url} ${response.status} ${response.length} - ${ms} ms`);
});
app.use(bodyParser());

const router = new KoaRouter();
router.post('/graphql', graphqlKoa(graphQLSettings));
router.get('/graphql', graphqlKoa(graphQLSettings));

app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', (error, ctx) => {
  Raven.captureException(error, (err, eventId) => {
    ctx.logger.error(`Reported error with event ${eventId}\n`, error);
  });
});

export const startListen = async (port) => {
  const server = await app.listen(port);
  graphQLSubscriptions({ server, path: '/subscriptions' });
};

export default app;
