import {
  AxisData,
  Options,
  ScaleData,
  Series,
  StoreModule,
  ValueEdge,
  CenterYAxisData,
  Axes,
  RadialAxisData,
} from '@t/store/store';
import {
  isLabelAxisOnYAxis,
  getAxisName,
  getSizeKey,
  hasBoxTypeSeries,
  isPointOnColumn,
} from '@src/helpers/axes';
import { extend } from '@src/store/store';
import { makeLabelsFromLimit } from '@src/helpers/calculator';
import { AxisTitle, BoxSeriesOptions, BarTypeYAxisOptions, RangeDataType, Rect } from '@t/options';
import {
  deepMergedCopy,
  hasNegativeOnly,
  isString,
  isUndefined,
  isNumber,
  pickProperty,
} from '@src/helpers/utils';
import { formatDate, getDateFormat } from '@src/helpers/formatDate';

interface StateProp {
  scale: ScaleData;
  axisSize: number;
  options: Options;
  series: Series;
  centerYAxis?: Pick<CenterYAxisData, 'xAxisHalfSize'> | null;
  zoomRange?: RangeDataType;
}

type ValueStateProp = StateProp & { categories: string[]; rawCategories: string[] };

export function isCenterYAxis(options: Options, isBar: boolean) {
  const diverging = !!pickProperty(options, ['series', 'diverging']);
  const alignCenter = (options.yAxis as BarTypeYAxisOptions)?.align === 'center';

  return isBar && diverging && alignCenter;
}

function isDivergingBoxSeries(series: Series, options: Options) {
  return hasBoxTypeSeries(series) && !!(options.series as BoxSeriesOptions)?.diverging;
}

function getZeroPosition(
  limit: ValueEdge,
  axisSize: number,
  labelAxisOnYAxis: boolean,
  isDivergingSeries: boolean
) {
  const { min, max } = limit;
  const hasZeroValue = min <= 0 && max >= 0;

  if (!hasZeroValue || isDivergingSeries) {
    return null;
  }

  const position = ((0 - min) / (max - min)) * axisSize;

  return labelAxisOnYAxis ? position : axisSize - position;
}

function makeFormattedCategory(categories: string[], options: Options) {
  const format = getDateFormat(options);

  return categories.map((category) => (format ? formatDate(format, new Date(category)) : category));
}

function isZooming(categories: string[], zoomRange?: RangeDataType) {
  return zoomRange && (zoomRange[0] !== 0 || zoomRange[1] !== categories.length - 1);
}

export function getLabelAxisData(stateProp: ValueStateProp) {
  const { axisSize, categories, series, options, scale, zoomRange, rawCategories } = stateProp;
  const pointOnColumn = isPointOnColumn(series, options);
  const labels =
    !isZooming(rawCategories, zoomRange) && scale
      ? makeLabelsFromLimit(scale.limit, scale.stepSize, options)
      : makeFormattedCategory(categories, options);

  const tickIntervalCount = categories.length - (pointOnColumn ? 0 : 1);
  const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
  const labelDistance = axisSize / (labels.length - (pointOnColumn ? 0 : 1));

  return {
    labels,
    pointOnColumn,
    isLabelAxis: true,
    tickCount: labels.length + (pointOnColumn ? 1 : 0),
    tickDistance,
    labelDistance,
  };
}

export function getValueAxisData(stateProp: StateProp) {
  const { scale, axisSize, series, options, centerYAxis } = stateProp;
  const { limit, stepSize } = scale;
  const size = centerYAxis ? centerYAxis?.xAxisHalfSize : axisSize;
  const divergingBoxSeries = isDivergingBoxSeries(series, options);
  const zeroPosition = getZeroPosition(
    limit,
    axisSize,
    isLabelAxisOnYAxis(series, options),
    divergingBoxSeries
  );
  let valueLabels = makeLabelsFromLimit(limit, stepSize);

  if (!centerYAxis && divergingBoxSeries) {
    valueLabels = getDivergingValues(valueLabels);
  }

  const axisData = {
    labels: valueLabels,
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount: valueLabels.length,
    tickDistance: size / valueLabels.length,
  } as AxisData;

  if (isNumber(zeroPosition)) {
    axisData.zeroPosition = zeroPosition;
  }

  return axisData;
}

function getDivergingValues(valueLabels) {
  return hasNegativeOnly(valueLabels)
    ? valueLabels.reverse().slice(1).concat(valueLabels)
    : valueLabels.slice(1).reverse().concat(valueLabels);
}

function makeTitleOption(title?: AxisTitle) {
  if (isUndefined(title)) {
    return title;
  }

  const defaultOption = {
    text: '',
    offsetX: 0,
    offsetY: 0,
  };

  return isString(title)
    ? deepMergedCopy(defaultOption, { text: title })
    : deepMergedCopy(defaultOption, title);
}

function getRadialAxis(scale: ScaleData, plot: Rect): RadialAxisData {
  const { limit, stepSize } = scale;
  const { width, height } = plot;
  const valueLabels = makeLabelsFromLimit(limit, stepSize) as string[];

  valueLabels.push(`${Number(valueLabels[valueLabels.length - 1]) + stepSize}`);

  return {
    labels: valueLabels,
    axisSize: Math.min(width, height) / 2 - 50,
    centerX: width / 2,
    centerY: height / 2,
  };
}

const axes: StoreModule = {
  name: 'axes',
  state: ({ series, options }) => {
    const axesState: Axes = {
      xAxis: {
        tickInterval: options.xAxis?.tick?.interval ?? 1,
        labelInterval: options.xAxis?.label?.interval ?? 1,
        title: makeTitleOption(options.xAxis?.title),
      } as AxisData,
      yAxis: {
        tickInterval: options.yAxis?.tick?.interval ?? 1,
        labelInterval: options.yAxis?.label?.interval ?? 1,
        title: makeTitleOption(options.yAxis?.title),
      } as AxisData,
    };

    if (isCenterYAxis(options, !!series.bar)) {
      axesState.centerYAxis = {} as CenterYAxisData;
    }

    if (series.radar) {
      axesState.radialAxis = {} as RadialAxisData;
    }

    return {
      axes: axesState,
    };
  },
  action: {
    setAxesData({ state }) {
      const { scale, options, series, layout, zoomRange, categories = [], rawCategories } = state;
      const { xAxis, yAxis, plot } = layout;

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
      const { valueAxisName, labelAxisName } = getAxisName(labelAxisOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelAxisOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];
      const centerYAxis = state.axes.centerYAxis;
      const valueAxisData = getValueAxisData({
        scale: scale[valueAxisName],
        axisSize: valueAxisSize,
        options,
        series,
        centerYAxis: centerYAxis
          ? {
              xAxisHalfSize: (xAxis.width - yAxis.width) / 2,
            }
          : null,
      });

      const labelAxisData = getLabelAxisData({
        scale: scale[labelAxisName],
        axisSize: labelAxisSize,
        categories,
        rawCategories,
        options,
        series,
        zoomRange,
      });

      const axesState = {
        xAxis: labelAxisOnYAxis ? valueAxisData : labelAxisData,
        yAxis: labelAxisOnYAxis ? labelAxisData : valueAxisData,
      } as Axes;

      if (centerYAxis) {
        const xAxisHalfSize = (xAxis.width - yAxis.width) / 2;
        axesState.centerYAxis = deepMergedCopy(valueAxisData, {
          x: xAxis.x + xAxisHalfSize,
          xAxisHalfSize,
          secondStartX: (xAxis.width + yAxis.width) / 2,
          yAxisLabelAnchorPoint: yAxis.width / 2,
          yAxisHeight: yAxis.height,
        }) as CenterYAxisData;
      }

      if (state.axes.radialAxis) {
        axesState.radialAxis = getRadialAxis(scale[valueAxisName], plot);
      }

      this.notify(state, 'layout');

      extend(state.axes, axesState);
    },
  },
  computed: {},
  observe: {
    updateAxes() {
      this.dispatch('setAxesData');
    },
  },
};

export default axes;
