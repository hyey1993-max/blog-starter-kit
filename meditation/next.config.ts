import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개역한글 본문은 빌드 때 data/krv에 받아 두고 서버에서 파일로 읽는다.
  outputFileTracingIncludes: {
    "/**": ["./data/krv/**"],
  },
};

export default nextConfig;
