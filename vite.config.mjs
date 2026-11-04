import { defineConfig } from 'vite';
import { federation } from '@module-federation/vite';

const widgets = ['SvgLine', 'LineBox'];
export default defineConfig({
  base: './',
  plugins: [federation({
    name: 'ugsoSpezial',
    filename: 'customWidgets.js',
    exposes: Object.fromEntries(widgets.map(name => ['./' + name, './src/' + name + '.js'])),
    shared: { react: { singleton: true, requiredVersion: false }, 'react-dom': { singleton: true, requiredVersion: false } },
    dts: false,
  })],
  build: { outDir: 'widgets/vis-2-widgets-ugso-spezial', target: 'chrome89' },
});
