const path = require('node:path');
const assert = require('node:assert/strict');
const { tests } = require('@iobroker/testing');
const { common } = require('../io-package.json');
const pkg = require('../package.json');

tests.packageFiles(path.join(__dirname, '..'));

describe('Catalogue release metadata', () => {
    it('provides every catalogue language for each release', () => {
        const languages = ['en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'uk', 'zh-cn'];
        for (const [version, news] of Object.entries(common.news)) {
            for (const language of languages) {
                assert.ok(typeof news[language] === 'string' && news[language].trim(), `${version}: ${language}`);
            }
        }
    });

    it('contains news for the package version and declares React runtime dependencies', () => {
        assert.ok(common.news[pkg.version]);
        assert.ok(pkg.dependencies.react);
        assert.ok(pkg.dependencies['react-dom']);
    });
});
