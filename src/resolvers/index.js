import User from '../model/User';

export default (ctx) => {
  return {
    Query: {
      ping: () => User.find({}).exec(),
    },
  };
}
