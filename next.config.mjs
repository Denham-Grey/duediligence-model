/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The dev-only route badge would sit over the page in parity screenshots against the prototype.
  devIndicators: false,
};

export default nextConfig;
