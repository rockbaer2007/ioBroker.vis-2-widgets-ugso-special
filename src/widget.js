import React from 'react';
import { createPortal } from 'react-dom';
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
const animated = field('animated', 'checkbox', 'Animation aktivieren', {
  default: false,
  tooltip: 'Ohne Datenpunkt läuft die Animation vorwärts. Ein Datenpunkt kann sie anhalten oder umkehren.',
});
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
  numericField('arrowSize', 'Pfeilgröße', 5, 2, 20),
]);
const animation = group('ugsoAnimation', 'Animation', [
  animated, numericField('duration', 'Dauer pro Zyklus (s)', 1, 0.2, 20, 0.1),
  field('animationFlowColor', 'color', 'Bewegte Farbe', { default: '#ffffff' }),
  numericField('animationDashLength', 'Länge der bewegten Farbe', 8, 1, 100),
  numericField('animationGapLength', 'Länge der Grundfarbe', 5, 1, 100),
  field('testAnimation', 'checkbox', 'Animation testen', {
    default: false,
    tooltip: 'Zeigt die Animation im Editor auch bei ausgeschalteter Animation oder stehendem Datenpunkt.',
  }),
]);
const decimals = numericField('decimals', 'Nachkommastellen (−1 = automatisch)', -1, -1, 10);
const textStyle = group('ugsoDisplay', 'Darstellung', [unit, decimals]);
const boxStyle = group('ugsoDisplay', 'Darstellung', [color, unit, decimals]);
const clamp = (value, fallback, min, max) => Math.min(max, Math.max(min, number(value) ?? fallback));
const ends = ['start', 'end'];
const freePoint = (data, end) => [
  clamp(data[end + 'X'], end === 'start' ? 0 : 100, 0, 100),
  clamp(data[end + 'Y'], 50, 0, 100) * 0.4,
];
const pointsChanged = (previous, next) => next.some((point, index) =>
  point?.[0] !== previous[index]?.[0] || point?.[1] !== previous[index]?.[1]);

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
    lineSvg = React.createRef();
    dockPoints = [null, null];
    dockHandles = [null, null];
    dockFrame = null;
    dockDrag = null;

    componentDidMount() {
      super.componentDidMount();
      this.scheduleDockUpdate();
    }

    componentDidUpdate(...args) {
      super.componentDidUpdate(...args);
      this.scheduleDockUpdate();
    }

    componentWillUnmount() {
      if (this.dockFrame !== null) cancelAnimationFrame(this.dockFrame);
      super.componentWillUnmount();
    }

    scheduleDockUpdate() {
      const data = this.state.rxData ?? {};
      if (!this.lineSvg.current ||
          !(data.startDockWidget || data.endDockWidget || this.showDockHandles())) return;
      if (this.dockFrame === null) this.dockFrame = requestAnimationFrame(this.updateDockPoints);
    }

    updateDockPoints = () => {
      this.dockFrame = null;
      const svg = this.lineSvg.current;
      if (!svg) return;
      const data = this.state.rxData ?? {};
      const matrix = svg.getScreenCTM();
      const inverse = matrix?.inverse();
      const points = ends.map(end => {
        const id = data[end + 'DockWidget'];
        if (!inverse || !id || id === this.props.id) return null;
        const rect = this.dockTargetRect(id);
        if (!rect?.width || !rect.height) return null;
        const x = rect.left + rect.width * clamp(data[end + 'DockX'], 50, 0, 100) / 100;
        const y = rect.top + rect.height * clamp(data[end + 'DockY'], 50, 0, 100) / 100;
        const point = new DOMPoint(x, y).matrixTransform(inverse);
        return Number.isFinite(point.x) && Number.isFinite(point.y) ? [point.x, point.y] : null;
      });
      const handles = ends.map((end, index) => {
        if (!matrix || (!this.showDockHandles() && !(this.props.editMode && points[index]))) return null;
        const local = this.dockDrag?.end === end ? this.dockDrag.point : points[index] ?? freePoint(data, end);
        const screen = new DOMPoint(...local).matrixTransform(matrix);
        return [screen.x, screen.y];
      });
      const changed = pointsChanged(this.dockPoints, points) || pointsChanged(this.dockHandles, handles);
      this.dockPoints = points;
      this.dockHandles = handles;
      if (changed) this.forceUpdate();
      this.scheduleDockUpdate();
    };

    showDockHandles() {
      return this.props.editMode && this.props.selectedWidgets?.includes(this.props.id);
    }

    dockTargetRect(id) {
      const target = this.props.askView?.('getRef', { id });
      const element = target?.widDiv ?? target?.refService?.current;
      return element?.getBoundingClientRect();
    }

    moveDockHandle(event) {
      const drag = this.dockDrag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.stopPropagation();
      const inverse = this.lineSvg.current?.getScreenCTM()?.inverse();
      if (!inverse) return;
      const { clientX: x, clientY: y } = event;
      const view = this.props.context?.views?.[this.props.view];
      const hits = document.elementsFromPoint(x, y);
      let nearest = null;
      for (const id of Object.keys(view?.widgets ?? {})) {
        if (id === this.props.id) continue;
        const rect = this.dockTargetRect(id);
        if (!rect?.width || !rect.height) continue;
        const snapX = Math.max(rect.left, Math.min(rect.right, x));
        const snapY = Math.max(rect.top, Math.min(rect.bottom, y));
        const distance = Math.hypot(x - snapX, y - snapY);
        const layer = hits.findIndex(element => element.id === id);
        if (distance > 12 || (nearest && (distance > nearest.distance ||
            (distance === nearest.distance && (layer < 0 || (nearest.layer >= 0 && layer >= nearest.layer)))))) continue;
        nearest = { id, rect, snapX, snapY, distance, layer };
      }
      const local = new DOMPoint(nearest?.snapX ?? x, nearest?.snapY ?? y).matrixTransform(inverse);
      if (!Number.isFinite(local.x) || !Number.isFinite(local.y)) return;
      drag.target = nearest;
      drag.point = [local.x, local.y];
      this.forceUpdate();
    }

    finishDockHandle(event, save) {
      if (this.dockDrag?.pointerId !== event.pointerId) return;
      event.stopPropagation();
      const { end, target, point } = this.dockDrag;
      this.dockDrag = null;
      const { context, view, id } = this.props;
      const project = context?.views;
      const current = project?.[view]?.widgets?.[id];
      if (save && point && current && context.changeProject) {
        const data = { ...current.data, [end + 'DockWidget']: target?.id ?? '' };
        if (target) {
          data[end + 'DockX'] = (target.snapX - target.rect.left) / target.rect.width * 100;
          data[end + 'DockY'] = (target.snapY - target.rect.top) / target.rect.height * 100;
        } else {
          data[end + 'X'] = clamp(point[0], 50, 0, 100);
          data[end + 'Y'] = clamp(point[1] * 2.5, 50, 0, 100);
        }
        void context.changeProject({
          ...project,
          [view]: { ...project[view], widgets: { ...project[view].widgets, [id]: { ...current, data } } },
        });
      }
      this.forceUpdate();
    }

    renderDockHandles(data) {
      if (!this.props.editMode || !this.dockHandles.some(Boolean)) return null;
      const selected = this.showDockHandles();
      return createPortal(this.dockHandles.map((point, index) => {
        const end = ends[index];
        if (!point || (!selected && !data[end + 'DockWidget'])) return null;
        return h('span', {
          key: end,
          title: index === 0 ? 'Startpunkt ziehen' : 'Endpunkt ziehen',
          style: {
            position: 'fixed', left: point[0], top: point[1], width: 14, height: 14,
            boxSizing: 'border-box', border: '2px solid #ffdf32', borderRadius: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 1300,
            cursor: 'grab', touchAction: 'none', pointerEvents: selected ? 'auto' : 'none',
          },
          onPointerDown: event => {
            if (!selected || event.button !== 0 || this.dockDrag) return;
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            this.dockDrag = { end, pointerId: event.pointerId };
          },
          onPointerMove: event => this.moveDockHandle(event),
          onPointerUp: event => this.finishDockHandle(event, true),
          onPointerCancel: event => this.finishDockHandle(event, false),
          onLostPointerCapture: event => this.finishDockHandle(event, false),
          onClick: event => event.stopPropagation(),
        });
      }), document.body);
    }

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
        const testAnimation = name === 'SvgLine' && this.props.editMode &&
          (data.testAnimation === true || data.testAnimation === 'true');
        const active = testAnimation || (data.animated === true || data.animated === 'true') &&
          (!data.oid || convert(value, 'boolean') === true || (direction !== null && direction !== 0));
        const width = clamp(data.lineWidth, 3, 1, 40);
        const startDock = data.startDockWidget ? this.dockPoints[0] : null;
        const endDock = data.endDockWidget ? this.dockPoints[1] : null;
        const [x1, y1] = (this.dockDrag?.end === 'start' && this.dockDrag.point) || startDock || freePoint(data, 'start');
        const [x2, y2] = (this.dockDrag?.end === 'end' && this.dockDrag.point) || endDock || freePoint(data, 'end');
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
        const arrowSize = clamp(data.arrowSize, 5, 2, 20);
        const dashLength = clamp(data.animationDashLength, 8, 1, 100);
        const gapLength = clamp(data.animationGapLength, 5, 1, 100);
        const cycleOffset = (dashLength + gapLength) * (direction < 0 ? 1 : -1);
        const markerUrl = 'url(#' + this.lineMarkerId + ')';
        return h('svg', { ref: this.lineSvg, width: '100%', height: '100%', viewBox: '0 0 100 40', preserveAspectRatio: 'none',
          overflow: arrowStart || arrowEnd || startDock || endDock || this.dockDrag ? 'visible' : undefined,
          role: 'img', 'aria-label': label },
          h('g', { opacity: clamp(data.opacity, 100, 0, 100) / 100 },
            h('path', { d: path, stroke, strokeWidth: width,
              fill: 'none', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' }),
            active ? h('path', { d: path, stroke: data.animationFlowColor || '#ffffff', strokeWidth: width,
              fill: 'none', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke',
              strokeDasharray: dashLength + ' ' + gapLength },
              h('animate', { attributeName: 'stroke-dashoffset', from: 0, to: cycleOffset,
                dur: clamp(data.duration, 1, 0.2, 20) + 's', repeatCount: 'indefinite' })) : null,
            arrowStart || arrowEnd ? h('path', {
              d: path, fill: 'none', stroke: 'none', strokeWidth: width, vectorEffect: 'non-scaling-stroke',
              markerStart: arrowStart ? markerUrl : undefined,
              markerEnd: arrowEnd ? markerUrl : undefined,
            }) : null),
          name === 'ValueConnection' && value != null
            ? h('text', { x: 50, y: 13, textAnchor: 'middle', fill: 'currentColor', fontSize: 10 }, String(value)) : null,
          arrowStart || arrowEnd ? h('defs', null,
            h('marker', { id: this.lineMarkerId, viewBox: '0 0 6 6', refX: 6, refY: 3,
              markerWidth: arrowSize, markerHeight: arrowSize, orient: 'auto-start-reverse' },
            h('path', { d: 'M 0 0 L 6 3 L 0 6 Z', fill: stroke }))) : null,
          this.renderDockHandles(data));
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
