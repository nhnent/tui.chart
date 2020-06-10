import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { CircleLegendModel } from '@t/components/circleLegend';
import { BubbleChartOptions, BubbleSeriesType } from '@t/options';

export default class CircleLegend extends Component {
  models: { circleLegend: CircleLegendModel[] } = { circleLegend: [] };

  initialize() {
    this.type = 'circleLegend';
  }

  getMaxValue(bubbleData: BubbleSeriesType[]) {
    return bubbleData.reduce((acc, cur) => {
      return Math.max(acc, ...cur.data.map(({ r }) => r));
    }, -1);
  }

  render({ layout, series, axes, options }: ChartState<Options>) {
    if (!series.bubble) {
      throw new Error('circleLegend only available in bubble chart');
    }

    if (!(options as BubbleChartOptions).circleLegend?.visible) {
      return;
    }

    const bubbleData = series.bubble.data;

    this.rect = layout.legend;
    const { xAxis, yAxis } = axes;
    const xAxisTickSize = layout.plot.width / xAxis!.tickCount;
    const yAxisTickSize = layout.plot.height / yAxis!.tickCount;
    const radius = Math.min(xAxisTickSize, yAxisTickSize);

    this.renderCircleLegend(bubbleData, radius);
  }

  renderCircleLegend(bubbleData: BubbleSeriesType[], radius: number) {
    const value = this.getMaxValue(bubbleData);

    this.models.circleLegend = [
      {
        type: 'circleLegend',
        radius,
        value,
        x: radius,
        y: this.rect.height - radius,
      },
    ];
  }
}
