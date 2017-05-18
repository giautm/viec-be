import {
  GraphQLScalarType,
} from 'graphql';
import {
  GraphQLError,
} from 'graphql/error';
import {
  Kind,
} from 'graphql/language';

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (value) => {
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        throw new Error('Field error: value is an invalid Date');
      }

      return value.toJSON();
    }

    throw new Error('Field error: value is not an instance of Date');
  },
  parseValue: (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Field error: value is an invalid Date');
    }

    return date;
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
      throw new GraphQLError(`Query error: Can only parse strings or integers to dates but got a: ${ast.kind}`, [ast]);
    }

    const result = new Date(ast.kind === Kind.STRING
      ? ast.value
      : parseInt(ast.value));
    if (isNaN(result.getTime())) {
      throw new GraphQLError('Query error: Invalid date', [ast]);
    }
    if (ast.kind === Kind.STRING && ast.value !== result.toJSON()) {
      throw new GraphQLError('Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ', [ast]);
    }

    return result;
  },
});

export const GraphQLDateTime = DateTime;
