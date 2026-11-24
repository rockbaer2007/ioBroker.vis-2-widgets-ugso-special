const assert = require('node:assert/strict');
const helper = require('@iobroker/vis-2-widgets-testing');
const fs = require('node:fs');
const path = require('node:path');
const { version } = require('../package.json');

const adapterName = 'vis-2-widgets-ugso-special';

describe(adapterName, function () {
    this.timeout(300000);
    let objects;

    before(async () => {
        ({ objects } = await helper.startIoBroker());
        await helper.startBrowser(process.env.CI === 'true');
        await helper.createProject();
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
