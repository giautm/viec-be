export const Schema = `

scalar DateTime

interface Node {
  id: ID!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  node(id: ID!): Node
  ping: String!
}

type Comment {
    id: String
    content: String
}

type Subscription {
  commentAdded(repoFullName: String!): Comment
}

schema {
  query: Query
  subscription: Subscription
}
`;
