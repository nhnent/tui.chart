import { Options, Series, ChartOptionsUsingYAxis } from '@t/store/store';
import { LineTypeXAxisOptions, BulletChartOptions } from '@t/options';

export function isLabelAxisOnYAxis(series: Series, options: Options) {
  return !!series.bar || (!!series.bullet && !(options as BulletChartOptions)?.series?.vertical);
}

export function hasBoxTypeSeries(series: Series) {
  return !!series.column || !!series.bar || !!series.boxPlot || !!series.bullet;
}

export function isPointOnColumn(series: Series, options: Options) {
  if (hasBoxTypeSeries(series)) {
    return true;
  }

  if (series.line || series.area) {
    return Boolean((options.xAxis as LineTypeXAxisOptions)?.pointOnColumn);
  }

  return false;
}

export function getAxisName(labelAxisOnYAxis: boolean) {
  return {
    valueAxisName: labelAxisOnYAxis ? 'xAxis' : 'yAxis',
    labelAxisName: labelAxisOnYAxis ? 'yAxis' : 'xAxis',
  };
}

export function getSizeKey(labelAxisOnYAxis: boolean) {
  return {
    valueSizeKey: labelAxisOnYAxis ? 'width' : 'height',
    labelSizeKey: labelAxisOnYAxis ? 'height' : 'width',
  };
}

export function getLimitOnAxis(labels: string[]) {
  const values = labels.map((label) => Number(label));

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function hasSecondaryYAxis(options: ChartOptionsUsingYAxis) {
  return Array.isArray(options?.yAxis) && options.yAxis.length === 2;
}

export function getYAxisOption(options: ChartOptionsUsingYAxis) {
  const hasSecondaryY = hasSecondaryYAxis(options);

  return {
    yAxis: hasSecondaryY ? options.yAxis![0] : options.yAxis,
    secondaryYAxis: hasSecondaryY ? options.yAxis![1] : null,
  };
}

export function getValidValueAxisName(options: Options, seriesName: string, valueAxisName: string) {
  const { secondaryYAxis } = getYAxisOption(options);

  return secondaryYAxis?.chartType === seriesName ? 'secondaryYAxis' : valueAxisName;
}

export function getValueAxisNames(options: ChartOptionsUsingYAxis, valueAxisName: string) {
  const { yAxis, secondaryYAxis } = getYAxisOption(options);

  return valueAxisName !== 'xAxis' && secondaryYAxis
    ? [yAxis.chartType, secondaryYAxis.chartType].map((seriesName, index) =>
        seriesName
          ? getValidValueAxisName(options, seriesName, valueAxisName)
          : ['yAxis', 'secondaryYAxis'][index]
      )
    : [valueAxisName];
}
