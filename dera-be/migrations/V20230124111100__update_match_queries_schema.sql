ALTER TABLE match_queries ADD COLUMN content TEXT;

UPDATE match_queries SET content = match_query_body->>'content';

ALTER TABLE match_queries ALTER COLUMN content SET NOT NULL;

DROP INDEX match_queries_org_id_embedding_schema_id_from_api_idx;
CREATE INDEX ON match_queries (org_id, embedding_schema_id, content);
