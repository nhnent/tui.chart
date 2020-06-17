import Component from './component';
import { CircleModel, CircleResponderModel } from '@t/components/series';
import { LineChartOptions, LineTypeSeriesOptions, Point, CoordinateDataType } from '@t/options';
import { ClipRectAreaModel, LinePointsModel } from '@t/components/series';
import { ChartState, Legend, SeriesTheme, ValueEdge } from '@t/store/store';
import { LineSeriesType } from '@t/options';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateYValue } from '@src/helpers/coordinate';
import { deepCopyArray } from '@src/helpers/utils';
import { getRGBA } from '@src/helpers/color';

type DrawModels = LinePointsModel | ClipRectAreaModel | CircleModel;

interface LineSeriesDrawModels {
  rect: ClipRectAreaModel[];
  series: LinePointsModel[];
  hoveredSeries: CircleModel[];
}

interface RenderLineOptions {
  pointOnColumn: boolean;
  theme: SeriesTheme;
  options: LineTypeSeriesOptions;
  tickDistance: number;
}

type DatumType = CoordinateDataType | number;

export default class LineSeries extends Component {
  models: LineSeriesDrawModels = { rect: [], series: [], hoveredSeries: [] };

  drawModels!: LineSeriesDrawModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'lineSeries';
  }

  initUpdate(delta: number) {
    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
  }

  render(chartState: ChartState<LineChartOptions>) {
    const { layout, series, scale, theme, options, axes, categories = [], legend } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    const { yAxis } = scale;
    const { tickDistance, pointOnColumn } = axes.xAxis!;

    const renderLineOptions: RenderLineOptions = {
      pointOnColumn,
      options: options.series || {},
      theme: theme.series,
      tickDistance,
    };

    this.rect = layout.plot;

    const lineSeriesModel = this.renderLinePointsModel(
      series.line.data,
      yAxis.limit,
      renderLineOptions,
      categories,
      legend
    );

    const seriesCircleModel = this.renderCircleModel(lineSeriesModel);

    const tooltipDataArr = series.line.data.flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: DatumType, dataIdx) => {
        tooltipData.push({
          label: name,
          color: theme.series.colors[index],
          value: getCoordinateYValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)],
        });
      });

      return tooltipData;
    });

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: lineSeriesModel,
      hoveredSeries: [],
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(lineSeriesModel),
        hoveredSeries: [],
      };
    }

    this.responders = seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
    }));
  }

  renderClipRectAreaModel(isDrawModel?: boolean): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: isDrawModel ? 0 : this.rect.width,
      height: this.rect.height,
    };
  }

  renderLinePointsModel(
    seriesRawData: LineSeriesType[],
    limit: ValueEdge,
    renderOptions: RenderLineOptions,
    categories: string[],
    legend: Legend
  ): LinePointsModel[] {
    const { pointOnColumn, theme, options, tickDistance } = renderOptions;
    const { colors } = theme;
    const { spline } = options;

    return seriesRawData.map(({ data, name }, seriesIndex) => {
      const points: Point[] = [];
      const { active } = legend.data.find(({ label }) => label === name)!;
      const color = getRGBA(colors[seriesIndex], active ? 1 : 0.3);

      data.forEach((datum, idx) => {
        const value = getCoordinateYValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx);

        const valueRatio = getValueRatio(value, limit);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        points.push({ x, y });
      });

      if (spline) {
        setSplineControlPoint(points);
      }

      return {
        type: 'linePoints',
        lineWidth: 6,
        color,
        points,
        seriesIndex,
      };
    });
  }

  renderCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color }, seriesIndex) =>
      points.map(({ x, y }) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
      }))
    );
  }

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    this.drawModels.hoveredSeries = [...responders];

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }
}
