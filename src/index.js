// @flow
import 'babel-polyfill';
import 'source-map-support/register';

import mongoose from 'mongoose';
import Raven from 'raven';

// Replace with your sentry DSN.
Raven.config('https://a993a0483e434eaabad7e9763dd81254:3830047d1df54bc9a53277f27347b25c@sentry.io/156904').install();

import app from './app';

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
    app.on('error', (error, ctx) => {
      Raven.captureException(error, (err, eventId) => {
        ctx.logger.error(`Reported error with event ${eventId}\n`, error);
      });
    });

    await connectDatabase();
    await app.listen(PORT);
    console.log(`Server started on port ${PORT}`);
  } catch (error) {
    Raven.captureException(error);
  }
})();
