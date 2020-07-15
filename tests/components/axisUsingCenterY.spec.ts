import AxisUsingCenterY from '@src/component/axisUsingCenterY';
import Store from '@src/store/store';
import { BarChartOptions } from '@t/options';
import EventEmitter from '@src/eventEmitter';

let axis;

describe('yAxis', () => {
  beforeEach(() => {
    axis = new AxisUsingCenterY({
      store: {} as Store<BarChartOptions>,
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
          },
          centerYAxis: {
            visible: false,
          },
        },
      });
    });

    it('should not create models, when not using center y axis', () => {
      expect(axis.models.tick).toEqual([]);
      expect(axis.models.label).toEqual([]);
      expect(axis.models.axisLine).toEqual([]);
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
          centerYAxis: {
            visible: true,
            xAxisHalfSize: 35,
            secondStartX: 45,
            yAxisLabelAnchorPoint: 5,
            yAxisHeight: 80,
          },
        },
      });
    });

    it('should have two axis lines', () => {
      expect(axis.models.axisLine).toHaveLength(2);
    });

    it('should have tick models pointing to the left and right respectively', () => {
      const tickModel = axis.models.tick;
      const ticksToLeft = tickModel.filter(({ tickSize }) => tickSize === -5);
      const ticksToRight = tickModel.filter(({ tickSize }) => tickSize === 5);

      expect(tickModel).toHaveLength(12);
      expect(ticksToLeft).toHaveLength(6);
      expect(ticksToRight).toHaveLength(6);
    });

    it('should be text alignment center', () => {
      const labelModel = axis.models.label;
      const isAlignCenter = labelModel.every(({ style }) => style[1].textAlign === 'center');

      expect(isAlignCenter).toBeTruthy();
    });
  });
});

describe('xAxis', () => {
  beforeEach(() => {
    axis = new AxisUsingCenterY({
      store: {} as Store<BarChartOptions>,
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
          },
          centerYAxis: {
            visible: false,
          },
        },
      });
    });

    it('should not create models, when not using center y axis', () => {
      expect(axis.models.tick).toEqual([]);
      expect(axis.models.label).toEqual([]);
      expect(axis.models.axisLine).toEqual([]);
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
          centerYAxis: {
            visible: true,
            xAxisHalfSize: 35,
            secondStartX: 45,
            yAxisLabelAnchorPoint: 5,
            yAxisHeight: 80,
          },
        },
      });
    });

    it('should have two axis lines', () => {
      expect(axis.models.axisLine).toHaveLength(2);
    });

    it('should have tick models pointing to the left and right respectively', () => {
      expect(axis.models.tick).toHaveLength(10);
    });

    it('should have diverging labels', () => {
      const labelModel = axis.models.label;
      const divergingLabels = labelModel.map(({ text }) => text);

      expect(divergingLabels).toEqual(['5', '1', '4', '2', '3', '3', '2', '4', '1', '5']);
    });
  });
});
