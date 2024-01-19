CREATE TABLE org_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  org_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL
);