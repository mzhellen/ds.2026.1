import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // definindo a pasta atual como raiz para resolver aviso de conflito de rotas
  },
};

export default nextConfig;
