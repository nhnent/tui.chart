import Component from './component';
import { LineModel } from '@t/components/axis';
import { ChartState, Options, AxisData, Series } from '@t/store/store';
import { isLabelAxisOnYAxis, hasBoxTypeSeries } from '@src/helpers/axes';
import { hasNegative } from '@src/helpers/utils';
import { AxisType } from './axis';
import { makeTickPixelPositions, crispPixel } from '@src/helpers/calculator';
import Painter from '@src/painter';

function needZeroLine(series: Series, axes: Partial<Record<AxisType, AxisData>>) {
  if (!hasBoxTypeSeries(series)) {
    return false;
  }

  const valueAxisName = isLabelAxisOnYAxis(series) ? 'xAxis' : 'yAxis';

  return hasNegative(axes[valueAxisName]?.labels);
}

export default class PlotAxis extends Component {
  name!: string;

  models: LineModel[] = [];

  drawModels!: LineModel[];

  initialize() {
    this.type = 'plotAxis';
    this.name = name;
  }

  render({ layout, axes, series }: ChartState<Options>) {
    this.rect = layout.plot;

    const labelAxisOnYAxis = isLabelAxisOnYAxis(series);

    const valueAxisName = labelAxisOnYAxis ? 'xAxis' : 'yAxis';
    const size = labelAxisOnYAxis ? this.rect.width : this.rect.height;
    const { labels, tickCount } = axes[valueAxisName]!;
    const relativePositions = makeTickPixelPositions(size, tickCount);
    const axisLabels = labelAxisOnYAxis ? labels : [...labels].reverse();

    this.models = needZeroLine(series, axes)
      ? this.renderZeroModel(relativePositions, axisLabels, labelAxisOnYAxis)
      : [];

    this.drawModels = this.models;
  }

  renderZeroModel(relativePositions: number[], labels: string[], vertical: boolean): LineModel[] {
    const zeroPixel = crispPixel(0);
    const index = labels.findIndex((label) => Number(label) === 0);
    const position = crispPixel(relativePositions[index]);

    if (index < 0) {
      return [];
    }

    let model: LineModel;

    if (vertical) {
      model = {
        type: 'line',
        x: position,
        y: zeroPixel,
        x2: position,
        y2: crispPixel(this.rect.height),
      };
    } else {
      model = {
        type: 'line',
        x: zeroPixel,
        y: position,
        x2: this.rect.width,
        y2: crispPixel(position),
      };
    }

    return [model];
  }

  beforeDraw(painter: Painter) {
    painter.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    painter.ctx.lineWidth = 1;
  }
}
