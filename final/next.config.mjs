/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        reactCompiler: true,
    },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "uxsdkfsmgdzcysprxxhb.supabase.co",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },
        ],
    },
    webpack: (config) => {
        // ✅ 抑制 Critical dependency 警告
        config.module.exprContextCritical = false;
        return config;
    },
};

export default nextConfig;
