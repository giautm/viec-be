import Query from './Query';
import {
  GraphQLDateTime
} from './type';

export default () => {
  return {
    DateTime: GraphQLDateTime,
    Query,
    Subscription: {
      commentAdded: (comment) => {
        // the subscription payload is the comment.
        return comment;
      },
    },
  };
}
