import User from '../../model/User';

export default () => {
  return {
    Query: {
      ping: () => {
        return 'pong';
      },
    },
    Subscription: {
      commentAdded: (comment) => {
        // the subscription payload is the comment.
        return comment;
      },
    },
  };
}
