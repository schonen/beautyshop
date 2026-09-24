/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      // Ajoute ici ton domaine de production après déploiement, ex:
      // { protocol: "https", hostname: "beautyshop.vercel.app" },
    ],
  },
};

module.exports = nextConfig;
