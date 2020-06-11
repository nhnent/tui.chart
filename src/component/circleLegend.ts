import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { CircleLegendModel } from '@t/components/circleLegend';
import { BubbleSeriesType } from '@t/options';
import { getMaxRadius } from '@src/component/bubbleSeries';
import { showCircleLegend } from '@src/store/layout';

export default class CircleLegend extends Component {
  models: { circleLegend: CircleLegendModel[] } = { circleLegend: [] };

  initialize() {
    this.type = 'circleLegend';
  }

  render({ layout, series, options }: ChartState<Options>) {
    if (!series.bubble) {
      throw new Error('circleLegend is only possible when bubble series is present');
    }

    if (!showCircleLegend(this.store.state.options, !!series.bubble)) {
      return;
    }

    const bubbleData = series.bubble.data;
    this.rect = layout.legend;
    this.renderCircleLegend(bubbleData);
  }

  renderCircleLegend(bubbleData: BubbleSeriesType[]) {
    const value = getMaxRadius(bubbleData);
    const radius = this.rect.width / 2;

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
