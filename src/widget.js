import React from 'react';
import { calculate, convert, number } from './logic.js';

const h = React.createElement;
const field = (name, type, label, extra = {}) => ({ name, type, label, ...extra });
const input = field('oid', 'id', 'Datenpunkt A');
const second = field('oidB', 'id', 'Datenpunkt B');
const unit = field('unit', 'text', 'Einheit');
const operation = field('operation', 'select', 'Rechenart', {
  options: ['add', 'subtract', 'multiply', 'divide'], default: 'add',
});
const conversion = field('conversion', 'select', 'Konvertierung', {
  options: ['number', 'text', 'boolean'], default: 'number',
});
const color = field('color', 'color', 'Farbe', { default: '#38bdf8' });
const lineWidth = field('lineWidth', 'number', 'Linienbreite', { default: 3 });
const animated = field('animated', 'checkbox', 'Animation aktivieren', { default: false });

const definitions = {
  SvgLine: ['SVG-Line', [input, color, lineWidth, animated]],
  LineBox: ['SVG LineBox', [input, color, unit]],
  LineBoxMath: ['SVG LineBox Math', [input, second, operation, color, unit]],
  ValueConnection: ['Wert-Verbindung', [input, color, lineWidth]],
  ValueConverter: ['Wert-Konverter', [input, conversion, unit]],
  ValueCalculation: ['Wert-Berechnung', [input, second, operation, unit]],
};

export function createWidget(name) {
  const [label, fields] = definitions[name];
  return class UgsoWidget extends window.visRxWidget {
    static getWidgetInfo() {
      return {
        id: 'tplUgso' + name,
        visSet: 'vis-2-widgets-ugso-spezial',
        visSetLabel: 'UGSo Spezial',
        visSetColor: '#38bdf8',
        visName: label,
        visAttrs: [{ name: 'common', fields }],
      };
    }

    getWidgetInfo() {
      return UgsoWidget.getWidgetInfo();
    }

    renderWidgetBody(props) {
      super.renderWidgetBody(props);
      const data = this.state.rxData ?? {};
      const values = this.state.values ?? {};
      const value = values[data.oid + '.val'];
      const stroke = data.color || '#38bdf8';

      if (name === 'SvgLine' || name === 'ValueConnection') {
        const direction = number(value);
        const active = data.animated && (value === true || (direction !== null && direction !== 0));
        const width = Math.min(40, Math.max(1, number(data.lineWidth) ?? 3));
        return h('svg', { width: '100%', height: '100%', viewBox: '0 0 100 40', preserveAspectRatio: 'none', role: 'img', 'aria-label': label },
          h('path', { d: 'M 0 20 H 100', stroke, strokeWidth: width, vectorEffect: 'non-scaling-stroke',
            strokeDasharray: active ? '8 5' : undefined },
            active ? h('animate', { attributeName: 'stroke-dashoffset', from: 0, to: direction < 0 ? 13 : -13,
              dur: '1s', repeatCount: 'indefinite' }) : null),
          name === 'ValueConnection' && value != null
            ? h('text', { x: 50, y: 13, textAnchor: 'middle', fill: 'currentColor', fontSize: 10 }, String(value)) : null);
      }

      let result = value;
      if (name === 'LineBoxMath' || name === 'ValueCalculation') {
        result = calculate(value, values[data.oidB + '.val'], data.operation);
      } else if (name === 'ValueConverter') {
        result = convert(value, data.conversion);
      }
      const text = result == null ? '—' : String(result) + (data.unit ? ' ' + data.unit : '');
      const isBox = name.startsWith('LineBox');
      return h('div', { style: {
        width: '100%', height: '100%', boxSizing: 'border-box', display: 'grid', placeItems: 'center',
        overflow: 'hidden', border: isBox ? '2px solid ' + stroke : undefined, borderRadius: isBox ? 8 : undefined,
      }, title: text }, text);
    }
  };
}
