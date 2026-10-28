import postgres from "postgres";

declare global {
  // 개발 서버의 핫 리로드 때 연결이 쌓이지 않도록 전역에 하나만 둔다.
  var __meditationSql: postgres.Sql | undefined;
}

export function getSql(): postgres.Sql {
  if (!globalThis.__meditationSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL이 설정되지 않았습니다");
    // Neon의 풀링 연결(pgbouncer)에서는 prepared statement를 쓰지 않는다.
    globalThis.__meditationSql = postgres(url, { max: 3, prepare: false, onnotice: () => {} });
  }
  return globalThis.__meditationSql;
}
