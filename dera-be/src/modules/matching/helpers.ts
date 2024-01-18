import { MatchOperator } from './types';

export function matchOperatorLabelToSql(matchOperator: MatchOperator): string {
  switch (matchOperator) {
    case MatchOperator.L2:
      return '<->';
    case MatchOperator.INNER_PRODUCT:
      return '<#>';
    case MatchOperator.COSINE_DISTANCE:
      return '<=>';
    default:
      throw new Error(`Unknown match operator ${matchOperator}`);
  }
}

export function postProcessMatchOpQuery(
  matchOperator: MatchOperator,
  matchQuery: string,
): string {
  switch (matchOperator) {
    case MatchOperator.L2:
      return matchQuery;
    case MatchOperator.INNER_PRODUCT:
      return `(${matchQuery}) * -1`;
    case MatchOperator.COSINE_DISTANCE:
      return `1 - (${matchQuery})`;
    default:
      throw new Error(`Unknown match operator ${matchOperator}`);
  }
}
