import { fileURLToPath } from 'node:url';
import { defineConfig, transformWithOxc } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

// Next.js compiles JSX inside .js files; Vite only does so for .jsx. This runs Vite's own Oxc
// transform on the app's .js sources (as if they were .jsx) before anything else sees them.
const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\/(components|app|lib)\/.*\.js$/.test(id.replace(/\\/g, '/')) || id.includes('node_modules')) return null;
    if (!code.includes('<')) return null;
    const out = await transformWithOxc(code, id.replace(/\.js$/, '.jsx'), { jsx: { runtime: 'automatic' } });
    return { code: out.code, map: out.map };
  },
};

export default defineConfig({
  plugins: [jsxInJs],
  resolve: { alias: { '@': root } },
  test: { include: ['tests/unit/**/*.test.js'] },
});
