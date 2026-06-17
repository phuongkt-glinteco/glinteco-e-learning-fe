import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Any standard config can be put here
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // Cho phép tất cả các đường dẫn con bên trong
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);

// https://lh3.googleusercontent.com/aida-public/AB6AXuAVfE1-ZnknMx9M00RSW3dBZN6QOl1IUj3zuw0jRZtNQNuJrkqUerogGX5eMSz7anZFjH2OlECuOs1TxlbExlhnUC-7UZWtA5Es0CDfXf7zxUsFdELRUwyKk_zPGnnGrOw8Z3doFeIq6k2tgCIQTy60Dba0PTv-eOFx6rsPHmOJ7g_YcGmpHkwsWSwtt__hsnt3UIv74cqZsFzIhRp64pnF02z4NsypUMZODNqkzpvfUFnDc2KsCA0TT4zTh_ANDa2K_B_pQr0yizI