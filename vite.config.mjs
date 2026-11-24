import { defineConfig } from 'vite';
import { federation } from '@module-federation/vite';
import { cpSync } from 'node:fs';

const widgets = ['SvgLine', 'LineBox'];
export default defineConfig({
  base: './',
  plugins: [{ name: 'widget-translations', closeBundle() {
    cpSync('src/i18n', 'widgets/vis-2-widgets-ugso-special/i18n', { recursive: true });
  } }, federation({
    name: 'ugsoSpezial',
    filename: 'customWidgets.js',
    exposes: Object.fromEntries(widgets.map(name => ['./' + name, './src/' + name + '.js'])),
    shared: { react: { singleton: true, requiredVersion: false }, 'react-dom': { singleton: true, requiredVersion: false } },
    dts: false,
  })],
  build: { outDir: 'widgets/vis-2-widgets-ugso-special', target: 'chrome89' },
});
