import Query from './Query';

export default () => {
  return {
    Query,
    Subscription: {
      commentAdded: (comment) => {
        // the subscription payload is the comment.
        return comment;
      },
    },
  };
}
