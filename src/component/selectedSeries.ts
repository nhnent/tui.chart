import Component from './component';
import { ChartState, Options } from '@t/store/store';
import {
  BoxPlotResponderModel,
  BulletResponderModel,
  CircleResponderModel,
  HeatmapRectResponderModel,
  RectResponderModel,
  ResponderModel,
} from '@t/components/series';
import {
  isClickSameCircleResponder,
  isClickSameNameResponder,
  isClickSameRectResponder,
} from '@src/helpers/responders';

interface SelectedSeriesEventModel {
  models: ResponderModel[];
  name: string;
}

export default class SelectedSeries extends Component {
  models: ResponderModel[] = [];

  isShow = false;

  isClickSameSeries({ models, name }: SelectedSeriesEventModel) {
    switch (name) {
      case 'heatmap':
        return isClickSameNameResponder<HeatmapRectResponderModel>(
          models as HeatmapRectResponderModel[],
          this.models as HeatmapRectResponderModel[]
        );
      case 'bullet':
        return isClickSameNameResponder<BulletResponderModel>(
          models as BulletResponderModel[],
          this.models as BulletResponderModel[]
        );
      case 'bubble':
      case 'scatter':
      case 'area':
      case 'line':
        return isClickSameCircleResponder(
          models as CircleResponderModel[],
          this.models as CircleResponderModel[]
        );
      case 'column':
      case 'bar':
        return isClickSameRectResponder<RectResponderModel>(
          models as RectResponderModel[],
          this.models as RectResponderModel[]
        );
      case 'boxPlot':
        return isClickSameRectResponder<BoxPlotResponderModel>(
          models as BoxPlotResponderModel[],
          this.models as BoxPlotResponderModel[]
        );
      default:
        return false;
    }
  }

  renderSelectedSeries = (selectedSeriesEventModel: SelectedSeriesEventModel) => {
    const { models } = selectedSeriesEventModel;
    console.log(models);
    const selectedSeries = this.isClickSameSeries(selectedSeriesEventModel) ? [] : models;

    this.isShow = !!selectedSeries.length;
    this.models = selectedSeries;
  };

  initialize() {
    this.type = 'selectedSeries';
    this.name = 'selectedSeries';
    this.eventBus.on('renderSelectedSeries', this.renderSelectedSeries);
  }

  render({ layout }: ChartState<Options>) {
    this.rect = layout.plot;
  }
}
