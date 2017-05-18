import Raven from 'raven';
import mongoose from 'mongoose';

const DOCKER_DB = process.env.MONGODB_PORT; // This is name of docker and posfix `_PORT`
const MONGODB_URI = DOCKER_DB
  ? DOCKER_DB.replace('tcp', 'mongodb') + '/myapp'
  : process.env.MONGODB_URI;

// Use native promises
mongoose.Promise = global.Promise;
mongoose.connection.on('open', () => {
  console.log('Mongoose: Connected to database!');
}).on('close', () => {
  Raven.captureMessage('Mongoose: Connection closed!');
  console.error('Mongoose: Connection closed!');
}).on('error', (error) => {
  Raven.captureException(error);
  console.error('Mongoose: Connection error.', error);
});

const connectWithRetry = (retryInterval) => {
  return mongoose.connect(MONGODB_URI, {
    server: {
      auto_reconnect: true,
      reconnectInterval: 1000,
      reconnectTries: Number.MAX_VALUE,
    },
  }).catch((error) => {
    Raven.captureException(error);
    // Retry connecting to mongo if initial connect fails
    console.error(`Mongoose: Failed to connect to mongo on startup - retrying in ${retryInterval} sec(s).`, error);
    setTimeout(connectWithRetry, retryInterval * 1000, retryInterval);
  });
};

connectWithRetry(5);

export const getConnection = () => {
  return Promise.resolve(mongoose.connection);
};

export { default as User } from './User';
