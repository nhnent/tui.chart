import Component from './component';
import { PieChartOptions, PieSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import { SectorModel, PieSeriesModels, SectorResponderModel } from '@t/components/series';
import { getRGBA } from '@src/helpers/color';
import {
  getRadialAnchorPosition,
  makeAnchorPositionParam,
  withinRadian,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { TooltipData } from '@t/components/tooltip';
import { isString } from '@src/helpers/utils';

type RenderOptions = {
  clockwise: boolean;
  cx: number;
  cy: number;
  drawingStartAngle: number;
  radiusRange: { inner: number; outer: number };
  angleRange: { start: number; end: number };
  totalAngle: number;
};

function hasClockwiseSemiCircle(clockwise: boolean, startAngle: number, endAngle: number) {
  return (
    clockwise && ((startAngle >= -90 && endAngle <= 90) || (startAngle >= 90 && endAngle <= 180))
  );
}

function hasAntiClockwiseSemiCircle(clockwise: boolean, startAngle: number, endAngle: number) {
  return (
    !clockwise && ((startAngle >= -180 && endAngle <= 90) || (startAngle <= 90 && endAngle >= -90))
  );
}

function getPercentage(input: string): number {
  return Number(input.substr(0, input.length - 1));
}

function getRadius(defaultRadius: number, radius: string | number): number {
  return isString(radius) ? (defaultRadius * getPercentage(radius)) / 100 : radius;
}

export default class PieSeries extends Component {
  models: PieSeriesModels = { series: [] };

  drawModels!: PieSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

  totalAngle = 360;

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    let currentDegree: number;

    const index = this.models.series.findIndex(({ clockwise, degree: { start, end } }) => {
      currentDegree = clockwise ? this.totalAngle * delta : 360 - this.totalAngle * delta;

      return withinRadian(clockwise, start, end, currentDegree);
    });

    if (index < 0) {
      return;
    }

    if (index) {
      const prevTargetEndDegree = this.models.series[index - 1].degree.end;

      if (this.drawModels.series[index - 1].degree.end !== prevTargetEndDegree) {
        this.drawModels.series[index - 1].degree.end = prevTargetEndDegree;
      }
    }

    this.drawModels.series[index].degree.end = currentDegree!;
  }

  initialize() {
    this.type = 'series';
    this.name = 'pieSeries';
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series, legend, dataLabels, categories, options } = chartState;

    if (!series.pie) {
      throw new Error("There's no pie data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);

    const pieData = series.pie?.data!;
    const renderOptions = this.makeRenderOptions(options);

    this.totalAngle = renderOptions.totalAngle;

    const seriesModel = this.renderPieModel(pieData, renderOptions);

    const tooltipModel = this.makeTooltipModel(pieData, categories);

    this.models.series = seriesModel;

    if (!this.drawModels) {
      this.drawModels = {
        series: this.models.series.map((m) => ({
          ...m,
          degree: { ...m.degree, end: m.degree.start },
        })),
      };
    }

    if (dataLabels?.visible) {
      this.store.dispatch('appendDataLabels', seriesModel);
    }

    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'sector',
      radius: m.radius,
      style: ['hover'],
      seriesIndex: index,
      data: tooltipModel[index],
    }));
  }

  makeRenderOptions(options: PieChartOptions): RenderOptions {
    const clockwise = options?.series?.clockwise ?? true;
    const startAngle = options?.series?.angleRange?.start ?? 0;
    const endAngle = options?.series?.angleRange?.end ?? 360;
    const totalAngle = this.getTotalAngle(clockwise, startAngle, endAngle);
    const isSemiCircular = this.isSemiCircle(clockwise, startAngle, endAngle);
    const { width, height } = this.rect;
    const defaultRadius = this.getDefaultRadius(isSemiCircular);
    const innerRadius = getRadius(defaultRadius, options.series?.radiusRange?.inner ?? 0);
    const outerRadius = getRadius(
      defaultRadius,
      options.series?.radiusRange?.outer ?? defaultRadius
    );

    const cx = width / 2;
    const cy = isSemiCircular ? this.getSemiCircleCenterY(clockwise) : height / 2;

    return {
      clockwise,
      cx,
      cy,
      drawingStartAngle: startAngle - 90,
      radiusRange: {
        inner: innerRadius,
        outer: outerRadius,
      },
      angleRange: {
        start: startAngle,
        end: endAngle,
      },
      totalAngle,
    };
  }

  renderPieModel(seriesRawData: PieSeriesType[], renderOptions: RenderOptions): SectorModel[] {
    const sectorModels: SectorModel[] = [];
    const total = seriesRawData.reduce((sum, { data }) => sum + data, 0);
    const {
      clockwise,
      cx,
      cy,
      drawingStartAngle,
      radiusRange: { inner, outer },
    } = renderOptions;
    const defaultStartDegree = clockwise ? 0 : 360;

    seriesRawData.forEach(({ data, name, color: seriesColor }, seriesIndex) => {
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor!, active ? 1 : 0.3);
      const degree = (data / total) * this.totalAngle * (clockwise ? 1 : -1);
      const startDegree = seriesIndex
        ? sectorModels[seriesIndex - 1].degree.end
        : defaultStartDegree;
      const endDegree = startDegree + degree;

      sectorModels.push({
        type: 'sector',
        name,
        color,
        x: cx,
        y: cy,
        degree: {
          start: startDegree,
          end: endDegree,
        },
        radius: {
          inner,
          outer,
        },
        value: data,
        style: ['default'],
        clockwise,
        drawingStartAngle,
      });
    });

    return sectorModels;
  }

  makeTooltipModel(seriesRawData: PieSeriesType[], categories?: string[]): TooltipData[] {
    return seriesRawData.map(({ data, name, color }) => ({
      label: name,
      color: color!,
      value: data,
      category: categories ? categories[0] : '',
    }));
  }

  makeTooltipResponder(responders: SectorResponderModel[]) {
    return responders.map((responder) => ({
      ...responder,
      ...getRadialAnchorPosition(
        makeAnchorPositionParam('center', this.models.series[responder.seriesIndex])
      ),
    }));
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', responders);
    this.activatedResponders = this.makeTooltipResponder(responders);

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }

  getTotalAngle(clockwise: boolean, startAngle: number, endAngle: number) {
    const totalAngle = Math.abs(endAngle - startAngle);

    return totalAngle !== 360 && !clockwise ? 360 - totalAngle : totalAngle;
  }

  getDefaultRadius(isSemiCircular = false) {
    const { width, height } = this.rect;

    return (isSemiCircular ? this.getSemiCicleRadius() : Math.min(width, height) / 2) * 0.9;
  }

  isSemiCircle(clockwise: boolean, startAngle: number, endAngle: number) {
    return (
      this.getTotalAngle(clockwise, startAngle, endAngle) <= 180 &&
      (hasClockwiseSemiCircle(clockwise, startAngle, endAngle) ||
        hasAntiClockwiseSemiCircle(clockwise, startAngle, endAngle))
    );
  }

  getSemiCicleRadius() {
    return this.rect.height * 0.9;
  }

  getSemiCircleCenterY(clockwise: boolean) {
    return clockwise ? this.rect.height * 0.9 : this.rect.height * 0.1;
  }
}
