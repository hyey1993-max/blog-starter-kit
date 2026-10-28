import postgres from "postgres";
import { SCHEMA_SQL } from "./schema";

declare global {
  // 개발 서버의 핫 리로드 때 연결이 쌓이지 않도록 전역에 하나만 둔다.
  var __meditationDb: Promise<postgres.Sql> | undefined;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** 연결을 만들고, 서버 인스턴스마다 처음 한 번 스키마를 적용한다. */
export function db(): Promise<postgres.Sql> {
  if (!globalThis.__meditationDb) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL이 설정되지 않았습니다");
    // Neon의 풀링 연결(pgbouncer)에서는 prepared statement를 쓰지 않는다.
    const sql = postgres(url, { max: 3, prepare: false, onnotice: () => {} });
    globalThis.__meditationDb = sql
      .unsafe(SCHEMA_SQL)
      .then(() => sql)
      .catch((err) => {
        globalThis.__meditationDb = undefined;
        throw err;
      });
  }
  return globalThis.__meditationDb;
}
