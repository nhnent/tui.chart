import AreaChart from '@src/charts/areaChart';
import { AreaSeriesData } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { avgTemperatureData } from './data';

export default {
  title: 'chart|Area'
};

const width = 1000;
const height = 500;
const defaultOptions = {
  chart: {
    width,
    height
  },
  yAxis: {},
  xAxis: {},
  series: {},
  tooltip: {},
  plot: {}
};

function createChart(data: AreaSeriesData, customOptions?: Record<string, any>) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  const chart = new AreaChart({ el, data, options });

  return { el, chart };
}

export const basic = () => {
  const { el } = createChart(avgTemperatureData, {
    xAxis: { pointOnColumn: true }
  });

  return el;
};

export const spline = () => {
  const { el } = createChart(avgTemperatureData, {
    xAxis: { pointOnColumn: true },
    series: { spline: true }
  });

  return el;
};
