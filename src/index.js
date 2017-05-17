// @flow
import 'babel-polyfill';
import 'source-map-support/register';
require('dotenv-safe').load();

import Raven from 'raven';
Raven.config(process.env.SENTRY_DSN).install();

import { startListen } from './app';

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await startListen(PORT);
    console.log(`Server started on port ${PORT}`);
  } catch (error) {
    Raven.captureException(error);
  }
})();
