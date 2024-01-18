CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  org_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  neon_project_id TEXT NOT NULL
);

CREATE INDEX ON projects (org_id);

CREATE TABLE embedding_schemas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  project_id uuid NOT NULL,
  creator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  neon_role_name TEXT NOT NULL,
  neon_endpoint_id TEXT NOT NULL,
  neon_endpoint_host TEXT NOT NULL,
  neon_branch_id TEXT NOT NULL,
  neon_branch_name TEXT NOT NULL,
  neon_branch_parent_id TEXT NOT NULL,
  neon_database_id BIGINT NOT NULL,
  neon_database_name TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX ON embedding_schemas (project_id);

CREATE TABLE embedding_schema_fields (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  embedding_schema_id uuid NOT NULL,
  name TEXT NOT NULL,
  datatype TEXT NOT NULL,
  default_value TEXT,
  is_nullable BOOLEAN NOT NULL,
  is_unique BOOLEAN NOT NULL,
  is_primary_key BOOLEAN NOT NULL,
  vector_length SMALLINT,
  FOREIGN KEY (embedding_schema_id) REFERENCES embedding_schemas(id) ON DELETE CASCADE
);

CREATE INDEX ON embedding_schema_fields (embedding_schema_id);

CREATE TABLE sdk_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  org_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  hashed_token TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE INDEX ON sdk_tokens (org_id);

CREATE TABLE match_queries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  org_id TEXT NOT NULL,
  embedding_schema_id uuid NOT NULL,
  from_api BOOLEAN NOT NULL,
  match_query_body JSONB NOT NULL,
  FOREIGN KEY (embedding_schema_id) REFERENCES embedding_schemas(id) ON DELETE CASCADE
);

CREATE INDEX ON match_queries (org_id, embedding_schema_id, from_api);

CREATE TABLE match_query_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  match_query_id uuid NOT NULL,
  match_query_result_body JSONB NOT NULL,
  match_time_taken_ms BIGINT NOT NULL,
  FOREIGN KEY (match_query_id) REFERENCES match_queries(id) ON DELETE CASCADE
);

CREATE INDEX ON match_query_results (match_query_id);