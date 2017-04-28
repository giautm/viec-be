// @flow
import 'babel-polyfill';
import 'source-map-support/register';
require('dotenv-safe').load();

import mongoose from 'mongoose';
import Raven from 'raven';
Raven.config(process.env.SENTRY_DSN).install();

import { startListen } from './app';

const DOCKER_DB = process.env.MONGODB_PORT; // This is name of docker and posfix `_PORT`
const MONGODB_URI = DOCKER_DB
  ? DOCKER_DB.replace('tcp', 'mongodb') + '/myapp'
  : process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

function connectDatabase() {
  return new Promise((resolve, reject) => {
    mongoose.Promise = global.Promise;
    mongoose.connection
      .on('error', error => reject(error))
      .on('close', () => console.log('Database connection closed.'))
      .once('open', () => resolve(mongoose.connections[0]));

    mongoose.connect(MONGODB_URI);
  });
}

(async () => {
  try {
    await connectDatabase();
    await startListen(PORT);
    console.log(`Server started on port ${PORT}`);
  } catch (error) {
    Raven.captureException(error);
  }
})();
