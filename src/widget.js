import React from 'react';
import { createPortal } from 'react-dom';
import { convert, number, trimLine } from './logic.js';

const h = React.createElement;
const lineChangedEvent = 'ugso-svg-line-changed';
const field = (name, type, label, extra = {}) => ({ name, type, label, ...extra });
const input = field('oid', 'id', 'Datenpunkt A');
const unit = field('unit', 'text', 'Einheit');
const color = field('color', 'color', 'Farbe', { default: '#38bdf8' });
const lineWidth = field('lineWidth', 'number', 'Linienbreite', { default: 3 });
const animated = field('animated', 'checkbox', 'Animation aktivieren', {
  default: false,
  tooltip: 'Ohne Datenpunkt läuft die Animation vorwärts. Ein Datenpunkt kann sie anhalten oder umkehren.',
});
const group = (name, label, fields) => ({ name, label, fields });
const source = group('ugsoSource', 'Datenquelle', [input]);
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
const boxStyle = group('ugsoDisplay', 'Darstellung', [
  color, numericField('diameter', 'Durchmesser (px)', 16, 4, 200), unit, decimals,
]);
const inputSlots = ['input1', 'input2', 'input3', 'input4'];
const outputSlots = ['output1', 'output2'];
const lineSlot = (key, label) => field(key, 'widget', label, { tpl: 'tplUgsoSvgLine', default: '' });
const nodePorts = group('ugsoPorts', 'Ein- und Ausgänge', [
  ...inputSlots.map((key, index) => lineSlot(key, 'Eingang ' + (index + 1))),
  ...outputSlots.map((key, index) => lineSlot(key, 'Ausgang ' + (index + 1))),
  field('correctionOid', 'id', 'Korrekturwert', { filter: { common: { type: 'number' } } }),
  field('sumOid', 'id', 'Summen-Datenpunkt (0_userdata.0)', {
    noSubscribe: true, filter: { common: { type: 'number', write: true } },
  }),
]);
const selectedPorts = (data, slots) => [...new Set(slots.map(key => data[key]).filter(Boolean))];
const clamp = (value, fallback, min, max) => Math.min(max, Math.max(min, number(value) ?? fallback));
const ends = ['start', 'end'];
const hasArrow = (data, end) => {
  const value = end === 'start' ? data.arrowAtStart : data.arrowAtEnd;
  return value === true || value === 'true';
};
const freePoint = (data, end) => [
  clamp(data[end + 'X'], end === 'start' ? 0 : 100, 0, 100),
  clamp(data[end + 'Y'], 50, 0, 100) * 0.4,
];
const pointsChanged = (previous, next) => next.some((point, index) =>
  point?.[0] !== previous[index]?.[0] || point?.[1] !== previous[index]?.[1]);

const definitions = {
  SvgLine: ['SVG-Line', [source, routing, lineStyle, animation]],
  LineBox: ['SVG LineBox', [boxStyle, nodePorts]],
};

export function createWidget(name) {
  const [label, groups] = definitions[name];
  return class UgsoWidget extends window.visRxWidget {
    lineSvg = React.createRef();
    nodeDot = React.createRef();
    dockPoints = [null, null];
    dockHandles = [null, null];
    dockFrame = null;
    dockDrag = null;
    lineScale = [0, 0];
    sum = null;
    sumFrame = null;
    lastLineInputs = null;
    outputValue = null;
    publishPending = false;
    mounted = false;

    componentDidMount() {
      super.componentDidMount();
      this.mounted = true;
      this.scheduleDockUpdate();
      document.addEventListener(lineChangedEvent, this.scheduleSum);
      this.notifyLineChange();
      this.scheduleSum();
    }

    componentDidUpdate(...args) {
      super.componentDidUpdate(...args);
      this.scheduleDockUpdate();
      this.notifyLineChange();
      this.scheduleSum();
    }

    componentWillUnmount() {
      if (this.dockFrame !== null) cancelAnimationFrame(this.dockFrame);
      this.mounted = false;
      document.removeEventListener(lineChangedEvent, this.scheduleSum);
      if (this.sumFrame !== null) cancelAnimationFrame(this.sumFrame);
      document.dispatchEvent(new Event(lineChangedEvent));
      super.componentWillUnmount();
    }

    notifyLineChange() {
      const svg = this.lineSvg.current;
      const data = this.state.rxData ?? {};
      const inputs = name === 'LineBox'
        ? [...selectedPorts(data, inputSlots), '|', ...selectedPorts(data, outputSlots), this.nodeDot.current?.dataset.ugsoCorrection]
        : [svg?.dataset.ugsoValue, svg?.dataset.ugsoStartDock, svg?.dataset.ugsoEndDock];
      if (this.lastLineInputs?.length === inputs.length &&
          this.lastLineInputs.every((value, index) => value === inputs[index])) return;
      this.lastLineInputs = inputs;
      document.dispatchEvent(new Event(lineChangedEvent));
    }

    scheduleSum = () => {
      if (this.sumFrame !== null) return;
      this.sumFrame = requestAnimationFrame(() => {
        this.sumFrame = null;
        if (name === 'SvgLine') {
          const output = this.lineInput(this.props.id, new Set());
          const value = output.fromNode ? output.value : null;
          if (value !== this.outputValue || output.fromNode !== this.fromNode) {
            this.outputValue = value;
            this.fromNode = output.fromNode;
            this.forceUpdate();
          }
          return;
        }
        const sum = this.nodeSum(this.props.id, new Set());
        const changed = sum !== this.sum;
        this.sum = sum;
        if (changed) {
          this.forceUpdate();
        }
        void this.publishSum();
      });
    };

    nodeData(id) {
      return this.props.context?.views?.[this.props.view]?.widgets?.[id]?.data ?? {};
    }

    lineInput(id, visited) {
      const line = this.dockTargetElement(id)?.querySelector('svg[data-ugso-line]');
      if (!line) return { fromNode: false, value: null };
      const { ugsoStartDock, ugsoEndDock, ugsoValue } = line.dataset;
      const producers = [...new Set([ugsoStartDock, ugsoEndDock].filter(Boolean))]
        .filter(nodeId => selectedPorts(this.nodeData(nodeId), outputSlots).includes(id));
      if (!producers.length) return { fromNode: false, value: number(ugsoValue) };
      return { fromNode: true, value: producers.length === 1 ? this.nodeSum(producers[0], visited) : null };
    }

    nodeSum(id, visited) {
      if (visited.has(id)) return null;
      const node = this.dockTargetElement(id)?.querySelector('[data-ugso-node]');
      if (!node) return null;
      const data = this.nodeData(id);
      const inputs = selectedPorts(data, inputSlots);
      const outputs = selectedPorts(data, outputSlots);
      if (inputs.some(lineId => outputs.includes(lineId))) return null;
      const correction = node.dataset.ugsoCorrection;
      let sum = number(correction);
      if (correction !== undefined && sum === null) return null;
      const path = new Set([...visited, id]);
      for (const lineId of inputs) {
        const line = this.dockTargetElement(lineId)?.querySelector('svg[data-ugso-line]');
        if (!line || (line.dataset.ugsoStartDock !== id && line.dataset.ugsoEndDock !== id)) return null;
        const { value } = this.lineInput(lineId, path);
        if (value === null) return null;
        sum = (sum ?? 0) + value;
      }
      return Number.isFinite(sum) ? sum : null;
    }

    async publishSum() {
      const { context, editMode } = this.props;
      const { sumOid, correctionOid } = this.state.rxData ?? {};
      const value = this.sum;
      if (editMode || value === null || !sumOid?.startsWith('0_userdata.0.') ||
          sumOid === correctionOid || this.publishPending ||
          (this.lastPublished?.id === sumOid && this.lastPublished.value === value)) return;
      const socket = context?.socket;
      if (!socket) return;
      this.publishPending = true;
      try {
        const object = await socket.getObject(sumOid);
        if (object?.type !== 'state' || object.common?.type !== 'number' || !object.common.write) return;
        const current = await socket.getState(sumOid);
        if (!this.mounted || this.props.editMode || this.sum !== value ||
            this.state.rxData?.sumOid !== sumOid || this.state.rxData?.correctionOid === sumOid) return;
        if (current?.val !== value) await socket.setState(sumOid, { val: value, ack: true });
        this.lastPublished = { id: sumOid, value };
      } catch (error) {
        console.warn('UGSo LineBox: Summe konnte nicht geschrieben werden.', error);
      } finally {
        this.publishPending = false;
        if (this.mounted && (this.sum !== value || this.state.rxData?.sumOid !== sumOid)) this.scheduleSum();
      }
    }

    scheduleDockUpdate() {
      const data = this.state.rxData ?? {};
      if (!this.lineSvg.current ||
          !(ends.some(end => hasArrow(data, end) || data[end + 'DockWidget']) || this.showDockHandles())) return;
      if (this.dockFrame === null) this.dockFrame = requestAnimationFrame(this.updateDockPoints);
    }

    updateDockPoints = () => {
      this.dockFrame = null;
      const svg = this.lineSvg.current;
      if (!svg) return;
      const data = this.state.rxData ?? {};
      const matrix = svg.getScreenCTM();
      const inverse = matrix?.inverse();
      const scale = matrix ? [Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d)] : [0, 0];
      const points = ends.map(end => {
        const id = data[end + 'DockWidget'];
        if (hasArrow(data, end) || !inverse || !id || id === this.props.id) return null;
        const waypoint = data[end + 'DockWaypoint'];
        if (waypoint) {
          const screen = this.linePointOnScreen(this.dockTargetElement(id)?.querySelector('svg[data-ugso-line]'), waypoint);
          if (!screen) return null;
          const point = screen.matrixTransform(inverse);
          return Number.isFinite(point.x) && Number.isFinite(point.y) ? [point.x, point.y] : null;
        }
        const target = this.dockTargetElement(id);
        const node = target?.querySelector('[data-ugso-node]');
        const rect = (node ?? target)?.getBoundingClientRect();
        if (!rect?.width || !rect.height) return null;
        const x = rect.left + rect.width * (node ? 50 : clamp(data[end + 'DockX'], 50, 0, 100)) / 100;
        const y = rect.top + rect.height * (node ? 50 : clamp(data[end + 'DockY'], 50, 0, 100)) / 100;
        const point = new DOMPoint(x, y).matrixTransform(inverse);
        return Number.isFinite(point.x) && Number.isFinite(point.y) ? [point.x, point.y] : null;
      });
      const handles = ends.map((end, index) => {
        if (hasArrow(data, end) || !matrix ||
            (!this.showDockHandles() && !(this.props.editMode && points[index]))) return null;
        const local = this.dockDrag?.end === end ? this.dockDrag.point : points[index] ?? freePoint(data, end);
        const screen = new DOMPoint(...local).matrixTransform(matrix);
        return [screen.x, screen.y];
      });
      const changed = pointsChanged(this.dockPoints, points) || pointsChanged(this.dockHandles, handles) ||
        (ends.some(end => hasArrow(data, end)) && scale.some((value, index) => value !== this.lineScale[index]));
      this.lineScale = scale;
      this.dockPoints = points;
      this.dockHandles = handles;
      if (changed) this.forceUpdate();
      this.scheduleDockUpdate();
    };

    showDockHandles() {
      return this.props.editMode && this.props.selectedWidgets?.includes(this.props.id);
    }

    dockTargetElement(id) {
      const target = this.props.askView?.('getRef', { id });
      return target?.widDiv ?? target?.refService?.current;
    }

    linePointOnScreen(svg, index) {
      const coordinates = svg?.getAttribute('data-ugso-waypoint-' + index);
      const matrix = coordinates && svg.getScreenCTM();
      if (!matrix) return null;
      const [x, y] = coordinates.split(' ').map(Number);
      return new DOMPoint(x, y).matrixTransform(matrix);
    }

    canDockToLinePoint(widgets, id, point, sourceEnd) {
      const visited = new Set([this.props.id + ':' + sourceEnd]);
      while (point === 'start' || point === 'end') {
        const key = id + ':' + point;
        if (visited.has(key)) return false;
        visited.add(key);
        const data = widgets[id]?.data;
        id = data?.[point + 'DockWidget'];
        point = data?.[point + 'DockWaypoint'];
      }
      return true;
    }

    moveDockHandle(event) {
      const drag = this.dockDrag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.stopPropagation();
      const inverse = this.lineSvg.current?.getScreenCTM()?.inverse();
      if (!inverse) return;
      const x = event.clientX - drag.grabX;
      const y = event.clientY - drag.grabY;
      const view = this.props.context?.views?.[this.props.view];
      const hits = document.elementsFromPoint(x, y);
      let nearest = null;
      for (const id of Object.keys(view?.widgets ?? {})) {
        if (id === this.props.id) continue;
        const element = this.dockTargetElement(id);
        const line = element?.querySelector('svg[data-ugso-line]');
        const layer = hits.findIndex(element => element.id === id);
        if (line) {
          for (const waypoint of ['start', 'end', 1, 2]) {
            const point = this.linePointOnScreen(line, waypoint);
            if (!point) continue;
            const distance = Math.hypot(x - point.x, y - point.y);
            if (distance <= 12 && (!nearest?.waypoint || distance < nearest.distance) &&
                this.canDockToLinePoint(view.widgets, id, waypoint, drag.end)) {
              nearest = { id, waypoint, snapX: point.x, snapY: point.y, distance, layer };
            }
          }
          continue;
        }
        if (nearest?.waypoint) continue;
        const node = element?.querySelector('[data-ugso-node]');
        const rect = (node ?? element)?.getBoundingClientRect();
        if (!rect?.width || !rect.height) continue;
        const snapX = node ? rect.left + rect.width / 2 : Math.max(rect.left, Math.min(rect.right, x));
        const snapY = node ? rect.top + rect.height / 2 : Math.max(rect.top, Math.min(rect.bottom, y));
        const distance = Math.hypot(x - snapX, y - snapY) - (node ? rect.width / 2 : 0);
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
      if (save && this.dockDrag.point) this.moveDockHandle(event);
      const { end, target, point } = this.dockDrag;
      this.dockDrag = null;
      const { context, view, id } = this.props;
      const project = context?.views;
      const current = project?.[view]?.widgets?.[id];
      if (save && point && current && !hasArrow(current.data, end) && context.changeProject) {
        const data = { ...current.data, [end + 'DockWidget']: target?.id ?? '' };
        delete data[end + 'DockWaypoint'];
        if (target?.waypoint) {
          data[end + 'DockWaypoint'] = target.waypoint;
        } else if (target) {
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
        if (hasArrow(data, end) || !point || (!selected && !data[end + 'DockWidget'])) return null;
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
            this.dockDrag = {
              end, pointerId: event.pointerId,
              grabX: event.clientX - point[0],
              grabY: event.clientY - point[1],
            };
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
        visDefaultStyle: { width: 180, height: name === 'SvgLine' ? 48 : 64 },
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
      const values = this.state.values ?? {};
      const value = values[data.oid + '.val'];
      const stroke = data.color || '#38bdf8';

      if (name === 'SvgLine') {
        const rawDirection = number(value);
        const direction = this.fromNode ? this.outputValue : rawDirection;
        const testAnimation = this.props.editMode &&
          (data.testAnimation === true || data.testAnimation === 'true');
        const hasFlow = this.fromNode
          ? direction !== null && direction !== 0
          : !data.oid || convert(value, 'boolean') === true || (direction !== null && direction !== 0);
        const active = testAnimation || (data.animated === true || data.animated === 'true') && hasFlow;
        const width = clamp(data.lineWidth, 3, 1, 40);
        const arrowStart = hasArrow(data, 'start');
        const arrowEnd = hasArrow(data, 'end');
        const startDock = !arrowStart && data.startDockWidget ? this.dockPoints[0] : null;
        const endDock = !arrowEnd && data.endDockWidget ? this.dockPoints[1] : null;
        const [x1, y1] = (!arrowStart && this.dockDrag?.end === 'start' && this.dockDrag.point) || startDock || freePoint(data, 'start');
        const [x2, y2] = (!arrowEnd && this.dockDrag?.end === 'end' && this.dockDrag.point) || endDock || freePoint(data, 'end');
        const points = [[x1, y1]];
        if (data.route === 'horizontal-first') points.push([x2, y1]);
        if (data.route === 'vertical-first') points.push([x1, y2]);
        const waypoints = [];
        if (data.route === 'waypoint') {
          waypoints.push([clamp(data.viaX, 50, 0, 100), clamp(data.viaY, 25, 0, 100) * 0.4]);
          if (data.secondWaypoint === true || data.secondWaypoint === 'true') {
            waypoints.push([clamp(data.via2X, 75, 0, 100), clamp(data.via2Y, 75, 0, 100) * 0.4]);
          }
        }
        points.push(...waypoints, [x2, y2]);
        const arrowSize = clamp(data.arrowSize, 5, 2, 20);
        const arrowLength = Math.max(4, arrowSize * width);
        const visiblePoints = trimLine(points, this.lineScale, arrowStart ? arrowLength : 0, arrowEnd ? arrowLength : 0);
        const visiblePath = visiblePoints.length ? 'M ' + visiblePoints.map(point => point.join(' ')).join(' L ') : '';
        const arrow = (tip, path, atStart) => {
          const [scaleX, scaleY] = this.lineScale;
          if (!scaleX || !scaleY) return null;
          const basePath = trimLine(path, this.lineScale, atStart ? arrowLength : 0, atStart ? 0 : arrowLength);
          const base = (atStart ? basePath[0] : basePath[basePath.length - 1]) ??
            (atStart ? path[path.length - 1] : path[0]);
          const dx = (base[0] - tip[0]) * scaleX;
          const dy = (base[1] - tip[1]) * scaleY;
          const length = Math.hypot(dx, dy);
          if (!length) return null;
          const halfWidth = arrowLength / 2;
          const offsetX = -dy / length * halfWidth / scaleX;
          const offsetY = dx / length * halfWidth / scaleY;
          return h('polygon', {
            points: [tip, [base[0] + offsetX, base[1] + offsetY], [base[0] - offsetX, base[1] - offsetY]]
              .map(point => point.join(',')).join(' '),
            fill: stroke,
          });
        };
        const dashLength = clamp(data.animationDashLength, 8, 1, 100);
        const gapLength = clamp(data.animationGapLength, 5, 1, 100);
        const cycleOffset = (dashLength + gapLength) * (direction < 0 ? 1 : -1);
        return h('svg', { ref: this.lineSvg, width: '100%', height: '100%', viewBox: '0 0 100 40', preserveAspectRatio: 'none',
          overflow: 'visible',
          'data-ugso-line': '',
          'data-ugso-value': rawDirection ?? undefined,
          'data-ugso-start-dock': arrowStart ? undefined : data.startDockWidget,
          'data-ugso-end-dock': arrowEnd ? undefined : data.endDockWidget,
          'data-ugso-waypoint-start': arrowStart ? undefined : [x1, y1].join(' '),
          'data-ugso-waypoint-end': arrowEnd ? undefined : [x2, y2].join(' '),
          'data-ugso-waypoint-1': waypoints[0]?.join(' '),
          'data-ugso-waypoint-2': waypoints[1]?.join(' '),
          role: 'img', 'aria-label': label },
          h('g', { opacity: clamp(data.opacity, 100, 0, 100) / 100 },
            visiblePath ? h('path', { d: visiblePath, stroke, strokeWidth: width,
              fill: 'none', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' }) : null,
            active && visiblePath ? h('path', { d: visiblePath, stroke: data.animationFlowColor || '#ffffff', strokeWidth: width,
              fill: 'none', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke',
              strokeDasharray: dashLength + ' ' + gapLength },
              h('animate', { attributeName: 'stroke-dashoffset', from: 0, to: cycleOffset,
                dur: clamp(data.duration, 1, 0.2, 20) + 's', repeatCount: 'indefinite' })) : null,
            arrowStart ? arrow(points[0], points, true) : null,
            arrowEnd ? arrow(points[points.length - 1], points, false) : null),
          this.renderDockHandles(data),
          this.props.editMode && waypoints.map(([x, y], index) => h('circle', {
            key: index, cx: x, cy: y, r: 1.5, fill: '#ef4444', stroke: '#fff',
            strokeWidth: 1, vectorEffect: 'non-scaling-stroke', pointerEvents: 'none',
          })));
      }

      const precision = Math.trunc(clamp(data.decimals, -1, -1, 10));
      const display = this.sum !== null && precision >= 0 ? this.sum.toFixed(precision) : this.sum;
      const text = display == null ? 'Keine Zahlenwerte angedockt' : String(display) + (data.unit ? ' ' + data.unit : '');
      const diameter = clamp(data.diameter, 16, 4, 200);
      const correctionOid = data.correctionOid;
      const correction = correctionOid && correctionOid !== 'nothing_selected'
        ? number(values[correctionOid + '.val']) ?? ''
        : undefined;
      return h('div', { style: {
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      } }, h('span', {
        ref: this.nodeDot, 'data-ugso-node': '', 'data-ugso-correction': correction,
        'data-ugso-sum': this.sum ?? undefined, role: 'img', title: text,
        'aria-label': 'Summe: ' + text,
        style: { flex: 'none', width: diameter, height: diameter, borderRadius: '50%', background: stroke },
      }));
    }
  };
}
