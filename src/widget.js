import React from 'react';
import { calculate, convert, number } from './logic.js';

const h = React.createElement;
let nextLineMarkerId = 0;
const field = (name, type, label, extra = {}) => ({ name, type, label, ...extra });
const input = field('oid', 'id', 'Datenpunkt A');
const second = field('oidB', 'id', 'Datenpunkt B');
const unit = field('unit', 'text', 'Einheit');
const operation = field('operation', 'select', 'Rechenart', {
  options: [
    { value: 'add', label: 'Addieren' },
    { value: 'subtract', label: 'Subtrahieren' },
    { value: 'multiply', label: 'Multiplizieren' },
    { value: 'divide', label: 'Dividieren' },
  ], default: 'add',
});
const conversion = field('conversion', 'select', 'Konvertierung', {
  options: [
    { value: 'number', label: 'Zahl' },
    { value: 'text', label: 'Text' },
    { value: 'boolean', label: 'Schaltwert' },
  ], default: 'number',
});
const color = field('color', 'color', 'Farbe', { default: '#38bdf8' });
const lineWidth = field('lineWidth', 'number', 'Linienbreite', { default: 3 });
const animated = field('animated', 'checkbox', 'Animation aktivieren', { default: false });
const group = (name, label, fields) => ({ name, label, fields });
const source = group('ugsoSource', 'Datenquelle', [input]);
const arithmetic = group('ugsoCalculation', 'Berechnung', [operation]);
const numericField = (name, label, value, min, max, step = 1) =>
  field(name, 'number', label, { default: value, min, max, step });
const routing = group('ugsoRouting', 'Linienführung', [
  field('route', 'select', 'Verlauf', {
    options: [
      { value: 'straight', label: 'Gerade' },
      { value: 'horizontal-first', label: 'Waagerecht, dann senkrecht' },
      { value: 'vertical-first', label: 'Senkrecht, dann waagerecht' },
      { value: 'waypoint', label: 'Über Zwischenpunkt' },
    ],
    default: 'straight',
    tooltip: 'Für einen rechten Winkel müssen sich Start und Ende auf beiden Achsen unterscheiden.',
    onChange: (_field, data, changeData) => {
      if (data.route !== 'horizontal-first' && data.route !== 'vertical-first') return;
      const startX = clamp(data.startX, 0, 0, 100);
      const startY = clamp(data.startY, 50, 0, 100);
      const sameX = startX === clamp(data.endX, 100, 0, 100);
      const sameY = startY === clamp(data.endY, 50, 0, 100);
      if (sameX) data.endX = startX <= 50 ? startX + 25 : startX - 25;
      if (sameY) data.endY = startY <= 50 ? startY + 25 : startY - 25;
      if (sameX || sameY) changeData(data);
    },
  }),
  numericField('startX', 'Start X (%)', 0, 0, 100),
  numericField('startY', 'Start Y (%)', 50, 0, 100),
  numericField('endX', 'Ende X (%)', 100, 0, 100),
  numericField('endY', 'Ende Y (%)', 50, 0, 100),
  { ...numericField('viaX', 'Zwischenpunkt X (%)', 50, 0, 100), hidden: 'data.route !== "waypoint"' },
  { ...numericField('viaY', 'Zwischenpunkt Y (%)', 25, 0, 100), hidden: 'data.route !== "waypoint"' },
  field('secondWaypoint', 'checkbox', 'Zweiten Zwischenpunkt verwenden', {
    default: false, hidden: 'data.route !== "waypoint"',
  }),
  {
    ...numericField('via2X', 'Zweiter Zwischenpunkt X (%)', 75, 0, 100),
    hidden: 'data.route !== "waypoint" || (data.secondWaypoint !== true && data.secondWaypoint !== "true")',
  },
  {
    ...numericField('via2Y', 'Zweiter Zwischenpunkt Y (%)', 75, 0, 100),
    hidden: 'data.route !== "waypoint" || (data.secondWaypoint !== true && data.secondWaypoint !== "true")',
  },
]);
const lineStyle = group('ugsoLineStyle', 'Darstellung', [
  color, lineWidth, numericField('opacity', 'Deckkraft (%)', 100, 0, 100),
  field('arrowAtStart', 'checkbox', 'Pfeil am Anfang', { default: false }),
  field('arrowAtEnd', 'checkbox', 'Pfeil am Ende', { default: false }),
]);
const animation = group('ugsoAnimation', 'Animation', [
  animated, numericField('duration', 'Dauer pro Zyklus (s)', 1, 0.2, 20, 0.1),
  field('animationFlowColor', 'color', 'Bewegte Farbe', { default: '#ffffff' }),
]);
const decimals = numericField('decimals', 'Nachkommastellen (−1 = automatisch)', -1, -1, 10);
const textStyle = group('ugsoDisplay', 'Darstellung', [unit, decimals]);
const boxStyle = group('ugsoDisplay', 'Darstellung', [color, unit, decimals]);
const clamp = (value, fallback, min, max) => Math.min(max, Math.max(min, number(value) ?? fallback));

const definitions = {
  SvgLine: ['SVG-Line', [source, routing, lineStyle, animation]],
  LineBox: ['SVG LineBox', [source, boxStyle]],
  LineBoxMath: ['SVG LineBox Math', [group('ugsoSource', 'Datenquellen', [input, second]), arithmetic, boxStyle]],
  ValueConnection: ['Wert-Verbindung', [source, routing, {
    ...lineStyle,
    fields: [...lineStyle.fields, field('showInRuntime', 'checkbox', 'In Runtime anzeigen', { default: false })],
  }]],
  ValueConverter: ['Wert-Konverter', [source, group('ugsoConversion', 'Konvertierung', [conversion]), textStyle]],
  ValueCalculation: ['Wert-Berechnung', [group('ugsoSource', 'Datenquellen', [input, second]), arithmetic, textStyle]],
};

export function createWidget(name) {
  const [label, groups] = definitions[name];
  return class UgsoWidget extends window.visRxWidget {
    lineMarkerId = 'ugso-line-arrow-' + ++nextLineMarkerId;

    static getWidgetInfo() {
      return {
        id: 'tplUgso' + name,
        visSet: 'vis-2-widgets-ugso-spezial',
        visSetLabel: 'UGSo Spezial',
        visSetColor: '#38bdf8',
        visName: label,
        visDefaultStyle: { width: 180, height: name === 'SvgLine' || name === 'ValueConnection' ? 48 : 64 },
        visAttrs: groups.map(group => ({
          ...group,
          fields: group.fields.map(field => ({ ...field, options: structuredClone(field.options) })),
        })),
      };
    }

    getWidgetInfo() {
      return UgsoWidget.getWidgetInfo();
    }

    renderWidgetBody(props) {
      super.renderWidgetBody(props);
      const data = this.state.rxData ?? {};
      if (name === 'ValueConnection' && !this.props.editMode &&
          data.showInRuntime !== true && data.showInRuntime !== 'true') {
        return null;
      }
      const values = this.state.values ?? {};
      const value = values[data.oid + '.val'];
      const stroke = data.color || '#38bdf8';

      if (name === 'SvgLine' || name === 'ValueConnection') {
        const direction = number(value);
        const active = (data.animated === true || data.animated === 'true') &&
          (value === true || (direction !== null && direction !== 0));
        const width = clamp(data.lineWidth, 3, 1, 40);
        const x1 = clamp(data.startX, 0, 0, 100);
        const y1 = clamp(data.startY, 50, 0, 100) * 0.4;
        const x2 = clamp(data.endX, 100, 0, 100);
        const y2 = clamp(data.endY, 50, 0, 100) * 0.4;
        const points = [[x1, y1]];
        if (data.route === 'horizontal-first') points.push([x2, y1]);
        if (data.route === 'vertical-first') points.push([x1, y2]);
        if (data.route === 'waypoint') {
          points.push([clamp(data.viaX, 50, 0, 100), clamp(data.viaY, 25, 0, 100) * 0.4]);
          if (data.secondWaypoint === true || data.secondWaypoint === 'true') {
            points.push([clamp(data.via2X, 75, 0, 100), clamp(data.via2Y, 75, 0, 100) * 0.4]);
          }
        }
        points.push([x2, y2]);
        const path = 'M ' + points.map(point => point.join(' ')).join(' L ');
        const arrowStart = data.arrowAtStart === true || data.arrowAtStart === 'true';
        const arrowEnd = data.arrowAtEnd === true || data.arrowAtEnd === 'true';
        const markerUrl = 'url(#' + this.lineMarkerId + ')';
        return h('svg', { width: '100%', height: '100%', viewBox: '0 0 100 40', preserveAspectRatio: 'none',
          overflow: arrowStart || arrowEnd ? 'visible' : undefined, role: 'img', 'aria-label': label },
          h('g', { opacity: clamp(data.opacity, 100, 0, 100) / 100 },
            h('path', { d: path, stroke, strokeWidth: width,
              fill: 'none', vectorEffect: 'non-scaling-stroke',
              markerStart: arrowStart ? markerUrl : undefined,
              markerEnd: arrowEnd ? markerUrl : undefined }),
            active ? h('path', { d: path, stroke: data.animationFlowColor || '#ffffff', strokeWidth: width,
              fill: 'none', vectorEffect: 'non-scaling-stroke', strokeDasharray: '8 5' },
              h('animate', { attributeName: 'stroke-dashoffset', from: 0, to: direction < 0 ? 13 : -13,
                dur: clamp(data.duration, 1, 0.2, 20) + 's', repeatCount: 'indefinite' })) : null),
          name === 'ValueConnection' && value != null
            ? h('text', { x: 50, y: 13, textAnchor: 'middle', fill: 'currentColor', fontSize: 10 }, String(value)) : null,
          arrowStart || arrowEnd ? h('defs', null,
            h('marker', { id: this.lineMarkerId, viewBox: '0 0 6 6', refX: 6, refY: 3,
              markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' },
            h('path', { d: 'M 0 0 L 6 3 L 0 6 Z', fill: stroke }))) : null);
      }

      let result = value;
      if (name === 'LineBoxMath' || name === 'ValueCalculation') {
        result = calculate(value, values[data.oidB + '.val'], data.operation);
      } else if (name === 'ValueConverter') {
        result = convert(value, data.conversion);
      }
      const precision = Math.trunc(clamp(data.decimals, -1, -1, 10));
      const display = typeof result === 'number' && precision >= 0 ? result.toFixed(precision) : result;
      const text = display == null ? '—' : String(display) + (data.unit ? ' ' + data.unit : '');
      const isBox = name.startsWith('LineBox');
      return h('div', { style: {
        width: '100%', height: '100%', boxSizing: 'border-box', display: 'grid', placeItems: 'center',
        overflow: 'hidden', border: isBox ? '2px solid ' + stroke : undefined, borderRadius: isBox ? 8 : undefined,
      }, title: text }, text);
    }
  };
}
