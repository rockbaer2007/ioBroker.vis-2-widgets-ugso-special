import config, { esmConfig, reactConfig } from '@iobroker/eslint-config';
import globals from 'globals';

export default [
    { ignores: ['widgets/**', 'tmp/**', 'artifacts/**', 'node_modules/**'] },
    ...config,
    ...esmConfig.map(entry => ({ ...entry, files: ['src/**/*.js', '*.mjs'] })),
    ...reactConfig.map(entry => ({ ...entry, files: ['src/**/*.js'] })),
    {
        files: ['src/**/*.js'],
        languageOptions: { ecmaVersion: 'latest', globals: globals.browser },
    },
    {
        files: ['*.mjs', 'test/**/*.cjs'],
        languageOptions: { globals: { ...globals.node, ...globals.mocha } },
    },
];
