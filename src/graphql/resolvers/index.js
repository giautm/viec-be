import User from '../../model/User';

export default (ctx) => {
  return {
    Query: {
      ping: () => {
        return 'pong';
      },
    },
  };
}
