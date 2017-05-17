import mongoose from 'mongoose';

// Use native promises
mongoose.Promise = global.Promise;

let connectionPromise = null;

mongoose.connection
  .on('close', () => {
    connectionPromise = null;
    console.log('Mongoose: Database connection closed.');
  })
  .on('error', (error) => {
    connectionPromise = null;
    console.log('Mongoose: Connection error.', error);
  });

export { default as User } from './User';

export const connectDatabase = (uri) => {
  if (connectionPromise !== null) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(uri, {
    server: {
      auto_reconnect: false,
    },
  }).then(() => {
    console.log('Mongoose: Connected to database.');
    return mongoose.connection;
  }).catch((error) => {
    connectionPromise = null;
    console.log('Mongoose: Connection error.', error);
    return Promise.reject(error);
  });

  return connectionPromise;
};
