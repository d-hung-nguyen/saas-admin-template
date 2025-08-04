-- Create file: migrations/0002_create_agents_tables.sql
CREATE TABLE IF NOT EXISTS agencies (
  id          TEXT    NOT NULL PRIMARY KEY,
  name        TEXT    NOT NULL,
  code        TEXT    NOT NULL UNIQUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agents (
  id          TEXT    NOT NULL PRIMARY KEY,
  email       TEXT    NOT NULL UNIQUE,
  role        TEXT    NOT NULL CHECK(role IN ('agent','hotel_admin','regional_admin','global_admin')),
  agency_id   TEXT    REFERENCES agencies(id),
  first_name  TEXT,
  last_name   TEXT,
  telephone   TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);