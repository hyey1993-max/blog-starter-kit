// db/schema.sql을 적용한다. 연결 문자열이 없으면 (로컬 첫 빌드 등) 건너뛴다.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL이 없어 DB 마이그레이션을 건너뜁니다.");
  process.exit(0);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(path.join(here, "..", "db", "schema.sql"), "utf8");
const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql.unsafe(schema);
  console.log("DB 스키마 적용 완료");
} finally {
  await sql.end();
}
