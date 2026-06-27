import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@stellar/stellar-sdk"],
};

export default nextConfig;
