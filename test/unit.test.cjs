const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const en = require('../src/i18n/en.json');
const languages = ['en', 'de', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'ru', 'uk', 'zh-cn'];
const dictionaries = Object.fromEntries(languages.map(lang => [lang, require('../src/i18n/' + lang + '.json')]));
let language = 'en';
class BaseWidget {
    static t(key) { return (dictionaries[language] || en)[key] || key; }
    renderWidgetBody() {}
}
let source = fs.readFileSync(path.join(__dirname, '../src/widget.js'), 'utf8')
    .replace(/import setIcon from '[^']+';/, "const setIcon = '';" );
for (const name of ['react', 'react-dom', './logic.js', './i18n.js']) {
    const file = name.startsWith('.') ? path.join(__dirname, '../src', name) : require.resolve(name);
    source = source.replace("'" + name + "'", JSON.stringify(pathToFileURL(file).href));
}

describe('Eleven widget languages and unchanged project values', () => {
    let createWidget;
    before(async () => {
        global.window = { visRxWidget: BaseWidget };
        ({ createWidget } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')));
    });
    after(() => { delete global.window; });

    it('provides all eleven languages with identical non-empty keys', () => {
        assert.deepEqual(fs.readdirSync(path.join(__dirname, '../src/i18n')).sort(), languages.map(lang => lang + '.json').sort());
        assert.equal(Object.keys(en).length, 56);
        for (const table of Object.values(dictionaries)) {
            assert.deepEqual(Object.keys(en).sort(), Object.keys(table).sort());
            assert.ok(Object.values(table).every(value => typeof value === 'string' && value.trim()));
        }
    });

    it('translates every editor label, option and help text', () => {
        for (const name of ['SvgLine', 'LineBox']) {
            const info = createWidget(name).getWidgetInfo();
            assert.equal(info.id, 'tplUgso' + name);
            for (const group of info.visAttrs) {
                for (const key of [group.label, ...group.fields.flatMap(field =>
                    [field.label, field.tooltip, ...(field.options || []).map(option => option.label)])].filter(Boolean)) {
                    for (const [lang, table] of Object.entries(dictionaries)) assert.ok(table[key], lang + ': ' + key);
                }
            }
        }
    });

    it('retains stored field IDs, defaults and routing values', () => {
        const fields = createWidget('SvgLine').getWidgetInfo().visAttrs.flatMap(group => group.fields);
        const route = fields.find(field => field.name === 'route');
        assert.deepEqual(route.options.map(option => option.value), ['straight', 'horizontal-first', 'vertical-first', 'waypoint']);
        assert.equal(route.default, 'straight');
        assert.equal(fields.find(field => field.name === 'endX').default, 100);
        const data = { route: 'horizontal-first', startX: 0, startY: 50, endX: 0, endY: 50 };
        route.onChange(null, data, () => {});
        assert.equal(data.endX, 25);
        assert.equal(data.endY, 75);
    });

    it('renders translated runtime and accessible texts with English fallback', () => {
        for (const [lang, expected, sum] of [
            ['de', 'Keine Zahlenwerte angedockt', 'Summe:'],
            ['en', 'No numeric values docked', 'Sum:'],
            ['fr', 'Aucune valeur numérique connectée', 'Somme:'],
            ['ru', 'Нет подключённых числовых значений', 'Сумма:'],
            ['zh-cn', '未连接数值', '总和：'],
            ['sv', 'No numeric values docked', 'Sum:'],
        ]) {
            language = lang;
            const widget = new (createWidget('LineBox'))();
            widget.props = {};
            widget.state = { rxData: {}, values: {} };
            const output = widget.renderWidgetBody({ style: {} }).props.children;
            assert.equal(output.props.title, expected);
            assert.equal(output.props['aria-label'], sum + ' ' + expected);
            widget.sum = 12.5;
            widget.state.rxData = { decimals: 1, unit: 'W' };
            assert.equal(widget.renderWidgetBody({ style: {} }).props.children.props.title, '12.5 W');
        }
    });

    it('ships real translation files and removes GitHub installation instructions', () => {
        const common = require('../io-package.json').common;
        assert.equal(common.visWidgets.ugsoSpezial.i18n, true);
        assert.deepEqual(fs.readdirSync(path.join(__dirname, '../widgets/vis-2-widgets-ugso-special/i18n')).sort(), languages.map(lang => lang + '.json').sort());
        for (const lang of languages) {
            assert.deepEqual(JSON.parse(fs.readFileSync(path.join(__dirname, '../widgets/vis-2-widgets-ugso-special/i18n', lang + '.json'))), dictionaries[lang]);
        }
        assert.ok(!fs.existsSync(path.join(__dirname, '../README.de.md')));
        for (const file of ['../README.md', '../doc/de/README.md']) {
            assert.doesNotMatch(fs.readFileSync(path.join(__dirname, file), 'utf8'), /tarball\/|Von URL installieren|Installation über GitHub/);
        }
    });
});
