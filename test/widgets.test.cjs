const assert = require('node:assert/strict');
const helper = require('@iobroker/vis-2-widgets-testing');

const adapterName = 'vis-2-widgets-ugso-spezial';

describe(adapterName, function () {
    this.timeout(300000);

    before(async () => {
        await helper.startIoBroker();
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

    after(async () => {
        try {
            await helper.stopBrowser();
        } finally {
            await helper.stopIoBroker();
        }
    });
});
