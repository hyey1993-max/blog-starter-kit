// 혼자 쓰는 앱이라 비밀번호 하나로 로그인한다. 세션 쿠키는 "만료시각.서명" 형태이고,
// 서명 키가 APP_PASSWORD이므로 비밀번호를 바꾸면 모든 세션이 무효가 된다.

export const SESSION_COOKIE = "mn_session";
export const SESSION_DAYS = 180;

const encoder = new TextEncoder();

async function hmac(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(password: string, now = Date.now()): Promise<string> {
  const expires = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${await hmac(password, `session:${expires}`)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  password: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (!token || !password) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < now) return false;
  return timingSafeEqual(sig, await hmac(password, `session:${expires}`));
}

export async function checkPassword(input: string, password: string | undefined): Promise<boolean> {
  if (!password) return false;
  // 길이 차이로 새지 않도록 양쪽을 같은 키로 서명해 비교한다.
  return timingSafeEqual(await hmac("pw", input), await hmac("pw", password));
}
