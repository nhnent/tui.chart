import Component from './component';
import {
  AreaPointsModel,
  CircleModel,
  CircleResponderModel,
  LinePointsModel,
} from '@t/components/series';
import {
  AreaChartOptions,
  AreaSeriesType,
  LineTypeSeriesOptions,
  Point,
  RangeDataType,
} from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, Legend, SeriesTheme, ValueEdge } from '@t/store/store';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray } from '@src/helpers/utils';

type DrawModels = LinePointsModel | AreaPointsModel | ClipRectAreaModel | CircleModel;

interface AreaSeriesDrawModels {
  rect: ClipRectAreaModel[];
  series: AreaPointsModel[];
  hoveredSeries: (CircleModel | LinePointsModel)[];
}

interface RenderOptions {
  pointOnColumn: boolean;
  theme: SeriesTheme;
  options: LineTypeSeriesOptions;
  tickDistance: number;
}

type DatumType = number | RangeDataType;

export default class AreaSeries extends Component {
  models: AreaSeriesDrawModels = { rect: [], hoveredSeries: [], series: [] };

  drawModels!: AreaSeriesDrawModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  linePointsModel!: LinePointsModel[];

  initialize() {
    this.type = 'series';
    this.name = 'areaSeries';
  }

  initUpdate(delta: number) {
    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
  }

  public render(chartState: ChartState<AreaChartOptions>) {
    const { layout, series, scale, theme, options, axes, categories = [], legend } = chartState;
    if (!series.area) {
      throw new Error("There's no area data!");
    }

    const { yAxis } = scale;
    const { tickDistance, pointOnColumn } = axes.xAxis!;
    const areaData = series.area.data;
    const bottomYPoint = layout.xAxis.y - layout.xAxis.height + 10; // padding

    const renderOptions: RenderOptions = {
      pointOnColumn,
      options: options.series || {},
      theme: theme.series,
      tickDistance,
    };

    this.rect = layout.plot;

    this.linePointsModel = this.renderLinePointsModel(
      areaData,
      yAxis.limit,
      renderOptions,
      categories,
      legend
    );

    const areaSeriesModel = this.renderAreaPointsModel(this.linePointsModel, bottomYPoint);
    const seriesCircleModel = this.renderCircleModel(this.linePointsModel);
    const tooltipDataArr = this.makeTooltipData(areaData, renderOptions, categories);

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: areaSeriesModel,
      hoveredSeries: [],
      // linePoints: [],
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(areaSeriesModel),
        hoveredSeries: [],
        // linePoints: [],
      };
    }

    this.responders = seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex],
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

  makeTooltipData(areaData: AreaSeriesType[], { theme }: RenderOptions, categories: string[]) {
    return areaData.flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: DatumType, dataIdx) => {
        tooltipData.push({
          label: name,
          color: theme.colors[index],
          value: getCoordinateYValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)],
        });
      });

      return tooltipData;
    });
  }

  renderLinePointsModel(
    seriesRawData: AreaSeriesType[],
    limit: ValueEdge,
    renderOptions: RenderOptions,
    categories: string[],
    legend: Legend
  ): LinePointsModel[] {
    const { pointOnColumn, theme, options, tickDistance } = renderOptions;

    return seriesRawData.map(({ data, name }, seriesIndex) => {
      const points: Point[] = [];
      const { active } = legend.data.find(({ label }) => label === name)!;
      const color = getRGBA(theme.colors[seriesIndex], active ? 1 : 0.1);

      data.forEach((datum, idx) => {
        const value = getCoordinateYValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx);
        const valueRatio = getValueRatio(value, limit);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        points.push({ x, y });
      });

      if (options?.spline) {
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

  renderAreaPointsModel(
    linePointsModel: LinePointsModel[],
    bottomYPoint: number
  ): AreaPointsModel[] {
    return linePointsModel.map((m) => ({
      ...m,
      type: 'areaPoints',
      lineWidth: 0,
      color: 'rgba(0, 0, 0, 0)', // make area border transparent
      bottomYPoint,
      fillColor: m.color,
    }));
  }

  renderCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color, seriesIndex }) =>
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

  isAreaPointsModel(model: DrawModels): model is AreaPointsModel {
    return model.type === 'areaPoints';
  }

  applyAreaOpacity(opacity: number) {
    this.drawModels.series.filter(this.isAreaPointsModel).forEach((model) => {
      model.fillColor = getRGBA(model.fillColor, opacity);
    });
  }

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    if (this.activatedResponders.length) {
      this.applyAreaOpacity(1);
    }

    if (responders.length) {
      this.applyAreaOpacity(0.5);
    }

    const linePoints = responders.map(({ seriesIndex }) => this.linePointsModel[seriesIndex]);
    this.drawModels.hoveredSeries = [...linePoints, ...responders];
    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }
}
