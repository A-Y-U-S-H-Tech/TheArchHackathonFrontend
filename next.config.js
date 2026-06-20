/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["antd", "@ant-design/icons", "@ant-design/cssinjs", "rc-util", "rc-pagination", "rc-picker", "rc-input", "rc-table"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
