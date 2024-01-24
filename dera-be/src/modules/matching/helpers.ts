import { MatchQueryEntityWithSchemaJoined } from './match-query.entity';
import { MatchOperator, MatchQueryResp } from './types';

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

export function matchQueryEntityToResp(
  entity: MatchQueryEntityWithSchemaJoined,
): MatchQueryResp {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    orgId: entity.orgId,
    embeddingSchemaId: entity.embeddingSchemaId,
    fromApi: entity.fromApi,
    matchQueryBody: entity.matchQueryBody,
    content: entity.content,
    embeddingSchema: {
      embeddingSchemaId: entity.embeddingSchema.id,
      name: entity.embeddingSchema.name,
    },
  };
}
