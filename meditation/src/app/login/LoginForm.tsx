"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <input type="password" name="password" autoComplete="current-password" autoFocus required />
      <div className="row" style={{ marginTop: 12 }}>
        <button type="submit" disabled={pending}>
          {pending ? "확인 중…" : "들어가기"}
        </button>
      </div>
      {error && <p className="notice error">{error}</p>}
    </form>
  );
}
