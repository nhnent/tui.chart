import Axis from '@src/component/axis';
import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import EventEmitter from '@src/eventEmitter';

let axis;

describe('yAxis', () => {
  beforeEach(() => {
    axis = new Axis({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    axis.initialize({ name: 'yAxis' });
  });

  describe('make model properly', () => {
    beforeEach(() => {
      axis.render({
        layout: { yAxis: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2'],
            tickCount: 2,
            labelDistance: 40,
          },
        },
      });
    });

    it('tick model', () => {
      expect(axis.models.tick).toEqual([
        { isYAxis: true, type: 'tick', x: 10.5, y: 0.5, tickSize: -5 },
        { isYAxis: true, type: 'tick', x: 10.5, y: 80.5, tickSize: -5 },
      ]);
    });

    it('label model', () => {
      expect(axis.models.label).toEqual([
        {
          style: ['default', { textAlign: 'left' }],
          text: '2',
          type: 'label',
          x: 0.5,
          y: 20.5,
        },
        {
          style: ['default', { textAlign: 'left' }],
          text: '1',
          type: 'label',
          x: 0.5,
          y: 100.5,
        },
      ]);
    });

    it('axisLine', () => {
      expect(axis.models.axisLine).toEqual([{ type: 'line', x: 10.5, x2: 10.5, y: 0.5, y2: 80.5 }]);
    });
  });

  describe('interval', () => {
    beforeEach(() => {
      axis.render({
        layout: { yAxis: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 2,
            labelInterval: 2,
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            tickCount: 10,
          },
        },
      });
    });

    it('tick interval option apply the number of tick model', () => {
      expect(axis.models.tick).toHaveLength(5);
    });

    it('label interval option apply the number of label model', () => {
      expect(axis.models.label).toHaveLength(5);
    });
  });

  describe('using center y axis', () => {
    beforeEach(() => {
      axis.render({
        layout: { yAxis: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: true,
            tickDistance: 16,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2', '3', '4', '5'],
            tickCount: 6,
          },
          centerYAxis: {},
        },
      });
    });

    it('should have empty models', () => {
      expect(axis.models.axisLine).toHaveLength(0);
      expect(axis.models.tick).toHaveLength(0);
      expect(axis.models.label).toHaveLength(0);
    });
  });

  describe('using secondary y axis', () => {
    beforeEach(() => {
      axis.initialize({ name: 'rightYAxis' });

      axis.render({
        layout: { rightYAxis: { x: 80, y: 10, width: 20, height: 80 } },
        axes: {
          rightYAxis: {
            pointOnColumn: false,
            tickDistance: 16,
            labelDistance: 16,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['0', '1', '2', '3', '4', '5'],
            tickCount: 6,
          },
        },
      });
    });

    const result = {
      axisLine: [
        {
          type: 'line',
          x: 0.5,
          x2: 0.5,
          y: 0.5,
          y2: 80.5,
        },
      ],
      tick: [
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 0.5,
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 16.5,
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 32.5,
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 48.5,
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 64.5,
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 80.5,
        },
      ],
      label: [
        {
          style: [
            'default',
            {
              textAlign: 'right',
            },
          ],
          text: '5',
          type: 'label',
          x: 20.5,
          y: 0.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
            },
          ],
          text: '4',
          type: 'label',
          x: 20.5,
          y: 16.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
            },
          ],
          text: '3',
          type: 'label',
          x: 20.5,
          y: 32.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
            },
          ],
          text: '2',
          type: 'label',
          x: 20.5,
          y: 48.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
            },
          ],
          text: '1',
          type: 'label',
          x: 20.5,
          y: 64.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
            },
          ],
          text: '0',
          type: 'label',
          x: 20.5,
          y: 80.5,
        },
      ],
    };

    ['axisLine', 'tick', 'label'].forEach((modelType) => {
      it(`should have ${modelType} models for secondary y axis`, () => {
        expect(axis.models[modelType]).toEqual(result[modelType]);
      });
    });
  });
});

describe('xAxis', () => {
  beforeEach(() => {
    axis = new Axis({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });
    axis.initialize({ name: 'xAxis' });
  });

  describe('make model properly', () => {
    beforeEach(() => {
      axis.render({
        layout: { xAxis: { x: 10, y: 10, width: 80, height: 10 } },
        axes: {
          xAxis: {
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2'],
            tickCount: 2,
            labelDistance: 40,
          },
        },
      });
    });

    it('tick model', () => {
      expect(axis.models.tick).toEqual([
        { isYAxis: false, type: 'tick', x: 0.5, y: 0.5, tickSize: 5 },
        { isYAxis: false, type: 'tick', x: 80.5, y: 0.5, tickSize: 5 },
      ]);
    });

    it('label model', () => {
      expect(axis.models.label).toEqual([
        {
          style: ['default', { textAlign: 'center' }],
          text: '1',
          type: 'label',
          x: 20.5,
          y: 16.5,
        },
        {
          style: ['default', { textAlign: 'center' }],
          text: '2',
          type: 'label',
          x: 100.5,
          y: 16.5,
        },
      ]);
    });

    it('axisLine', () => {
      expect(axis.models.axisLine).toEqual([{ type: 'line', x: 0.5, x2: 80.5, y: 0.5, y2: 0.5 }]);
    });
  });

  describe('interval', () => {
    beforeEach(() => {
      axis.render({
        layout: { xAxis: { x: 10, y: 10, width: 80, height: 10 } },
        axes: {
          xAxis: {
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 2,
            labelInterval: 2,
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            tickCount: 10,
          },
        },
      });
    });

    it('tick interval option apply the number of tick model', () => {
      expect(axis.models.tick).toHaveLength(5);
    });

    it('label interval option apply the number of label model', () => {
      expect(axis.models.label).toHaveLength(5);
    });
  });

  describe('using center y axis', () => {
    beforeEach(() => {
      axis.render({
        layout: { xAxis: { x: 10, y: 10, width: 80, height: 10 } },
        axes: {
          xAxis: {
            pointOnColumn: false,
            tickDistance: 20,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2', '3', '4', '5'],
            tickCount: 5,
          },
          centerYAxis: {},
        },
      });
    });

    it('should have empty models', () => {
      expect(axis.models.axisLine).toHaveLength(0);
      expect(axis.models.tick).toHaveLength(0);
      expect(axis.models.label).toHaveLength(0);
    });
  });
});
