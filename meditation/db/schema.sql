-- 여러 번 실행해도 안전하도록 IF NOT EXISTS로만 작성한다.

CREATE TABLE IF NOT EXISTS threads (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       text NOT NULL,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  summary     text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entries (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id       bigint NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  concern         text NOT NULL,
  passage_ref     text NOT NULL,
  book_index      smallint NOT NULL,
  chapter         smallint NOT NULL,
  verse_start     smallint NOT NULL,
  verse_end       smallint NOT NULL,
  passage_text    text,
  draw_mode       text NOT NULL DEFAULT 'range',
  reroll_count    integer NOT NULL DEFAULT 0,
  interpretation  jsonb,
  my_response     text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS entries_thread_created_idx ON entries (thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS entries_created_idx ON entries (created_at DESC);

CREATE TABLE IF NOT EXISTS thread_reviews (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id   bigint NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
