import Koa from 'koa';
import KoaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import {
  graphqlKoa,
} from 'graphql-server-koa';

import logger from './logger';

import graphQL from './graphql';

const responseTime = () => async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  ctx.logger.info(`${ctx.method} ${ctx.url} - ${ms} ms`);
};

const app = new Koa();

app.use(logger());
app.use(responseTime());
app.use(bodyParser());

const router = new KoaRouter();
router.post('/graphql', graphqlKoa(graphQL));
router.get('/graphql', graphqlKoa(graphQL));

app.use(router.routes());
app.use(router.allowedMethods());

export default app;
