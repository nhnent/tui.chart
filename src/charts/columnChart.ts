import Chart from './chart';

import dataRange from '@src/store/dataRange';
import stackSeriesData from '@src/store/stackSeriesData';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';

import Axis from '@src/component/axis';
import BoxSeries from '@src/component/boxSeries';
import BoxStackSeries from '@src/component/boxStackSeries';
import Plot from '@src/component/plot';
import Tooltip from '@src/component/tooltip';

import * as basicBrushes from '@src/brushes/basic';
import * as axisBrushes from '@src/brushes/axis';
import * as boxBrushes from '@src/brushes/boxSeries';
import * as tooltipBrushes from '@src/brushes/tooltip';

import { ColumnChartOptions, BoxSeriesData } from '@t/options';

interface ColumnChartProps {
  el: HTMLElement;
  options: ColumnChartOptions;
  data: BoxSeriesData;
}

export default class ColumnChart extends Chart<ColumnChartOptions> {
  constructor({ el, options, data }: ColumnChartProps) {
    super({
      el,
      options,
      series: {
        column: data.series
      },
      categories: data.categories
    });
  }

  initialize() {
    super.initialize();

    this.store.setModule(stackSeriesData);
    this.store.setModule(dataRange);
    this.store.setModule(scale);
    this.store.setModule(axes);
    this.store.setModule(plot);

    this.componentManager.add(Plot);
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(BoxStackSeries, { name: 'column' });
    this.componentManager.add(BoxSeries, { name: 'column' });
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Tooltip);

    this.painter.addGroups([basicBrushes, axisBrushes, boxBrushes, tooltipBrushes]);
  }
}
