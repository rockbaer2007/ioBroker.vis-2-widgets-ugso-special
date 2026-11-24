/* global window, document */
const assert = require('node:assert/strict');
const helper = require('@iobroker/vis-2-widgets-testing');
const fs = require('node:fs');
const path = require('node:path');
const { version } = require('../package.json');
const languages = ['de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'ru', 'uk', 'zh-cn'];

const adapterName = 'vis-2-widgets-ugso-special';

describe(adapterName, function () {
    this.timeout(300000);
    let objects;
    let page;

    before(async () => {
        ({ objects } = await helper.startIoBroker());
        ({ page } = await helper.startBrowser(process.env.CI === 'true'));
        // Only this disposable test project is reloaded; discard its unsaved edits.
        page.on('dialog', dialog => { void (dialog.type() === 'beforeunload' ? dialog.accept() : dialog.dismiss()); });
        await helper.createProject();
    });

    it('loads all eleven languages in the real VIS editor and runtime tooltip', async () => {
        const system = await objects.getObjectAsync('system.config');
        const originalLanguage = system.common.language;
        try {
            for (const language of languages) {
                const messages = require('../src/i18n/' + language + '.json');
                const expected = messages['ugso_special_Data point A'];
                const noValue = messages['ugso_special_No numeric values docked'];
                system.common.language = language;
                await objects.setObjectAsync('system.config', system);
                await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
                await page.waitForFunction((lang, label) =>
                    window.visRxWidget?.getLanguage() === lang &&
                    window.visRxWidget.t('ugso_special_Data point A') === label,
                { timeout: 30000 }, language, expected);
                await helper.palette.openWidgetSet(page, adapterName);
                const line = await helper.palette.addWidget(page, 'tplUgsoSvgLine');
                await page.click('#' + line);
                await helper.screenshot(page, 'editor-' + language);
                await page.waitForFunction(label => document.body.innerText.includes(label),
                    { timeout: 10000 }, messages['ugso_special_Data source']);
                await helper.view.deleteWidget(page, line);
                const box = await helper.palette.addWidget(page, 'tplUgsoLineBox');
                await page.waitForFunction((id, title) =>
                    document.getElementById(id)?.querySelector('[data-ugso-node]')?.title === title,
                {}, box, noValue);
                await helper.screenshot(page, 'language-' + language);
                await helper.view.deleteWidget(page, box);
            }
        } finally {
            system.common.language = originalLanguage;
            await objects.setObjectAsync('system.config', system);
        }
    });

    it('installs both widgets and adds them from the VIS 2 palette', async () => {
        await helper.palette.openWidgetSet(null, adapterName);
        const widgets = await helper.palette.getListOfWidgets(null, adapterName);
        assert.deepEqual([...widgets].sort(), ['tplUgsoLineBox', 'tplUgsoSvgLine']);
        for (const name of widgets) {
            const id = await helper.palette.addWidget(null, name);
            assert.ok(id);
            await helper.view.deleteWidget(null, id);
        }
    });

    it('exports a fresh object dump from the working installed version', async () => {
        const installed = await objects.getObjectAsync('system.adapter.' + adapterName);
        assert.equal(installed.common.version, version);
        const result = await objects.getObjectListAsync({
            startkey: adapterName + '.', endkey: adapterName + '.\u9999', include_docs: true,
        });
        const dump = Object.fromEntries(result.rows.map(row => [row.id, row.doc]));
        assert.ok(Object.keys(dump).length, 'No installed widget metadata found');
        assert.ok(dump[adapterName + '.admin'], 'Missing widget admin metadata');
        assert.ok(Object.values(dump).every(object => object.type === 'meta'),
            'Frontend-only widget set unexpectedly owns runtime objects');
        fs.mkdirSync(path.join(__dirname, '../artifacts'), { recursive: true });
        fs.writeFileSync(path.join(__dirname, '../artifacts', adapterName + '-' + version + '.objects.json'),
            JSON.stringify(dump, null, 2) + '\n');
    });

    after(async () => {
        try {
            await helper.stopBrowser();
        } finally {
            await helper.stopIoBroker();
        }
    });
});
