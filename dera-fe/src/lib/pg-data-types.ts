// Note: we are maintaining two copies of these lists - one here and one in backend. May cause mismatches in the future.

export const PG_VECTOR_TYPES = ['vector'];

export const PG_VARCHAR_TYPES = ['text'];

export const PG_DATA_TYPES = [
  'smallint',
  'integer',
  'bigint',
  'decimal',
  'numeric',
  'real',
  'double precision',
  'serial',
  'bigserial',
  'int2',
  'int4',
  'int8',
  'float4',
  'float8',
  'smallserial',
  'serial2',
  'serial4',
  'serial8',
  'json',
  'jsonb',
  'timestamp',
  'timestamptz',
  'date',
  'time',
  'timetz',
  'uuid',
  'bool',
  ...PG_VARCHAR_TYPES,
  ...PG_VECTOR_TYPES,
];
