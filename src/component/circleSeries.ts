import Component from './component';
import { CircleModel, CircleResponderModel, CircleSeriesModels } from '@t/components/series';
import { Point, Rect } from '@t/options';
import { getDistance } from '@src/helpers/calculator';

export default abstract class CircleSeries extends Component {
  models: CircleSeriesModels = { series: [], selectedSeries: [] };

  drawModels!: CircleSeriesModels;

  responders!: CircleResponderModel[];

  activatedResponders: CircleResponderModel[] = [];

  rect!: Rect;

  initUpdate(delta: number) {
    this.drawModels.series.forEach((model, index) => {
      model.radius = (this.models.series[index] as CircleModel).radius * delta;
    });
  }

  getNearestResponder(responders: CircleResponderModel[], mousePosition: Point) {
    let minDistance = Infinity;
    let result: CircleResponderModel[] = [];
    responders.forEach((responder) => {
      const { x, y } = responder;
      const responderPoint = { x: x + this.rect.x, y: y + this.rect.y };
      const distance = getDistance(responderPoint, mousePosition);

      if (minDistance > distance) {
        minDistance = distance;
        result = [responder];
      } else if (minDistance === distance && result.length && result[0].radius > responder.radius) {
        result = [responder];
      }
    });

    return result;
  }

  onMousemove({ responders, mousePosition }) {
    const closestResponder = this.getNearestResponder(responders, mousePosition);

    this.eventBus.emit('renderHoveredSeries', { models: closestResponder, name: this.name });
    this.activatedResponders = closestResponder;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders, mousePosition }) {
    if (this.selectable) {
      this.drawModels.selectedSeries = this.getNearestResponder(responders, mousePosition);
      this.eventBus.emit('needDraw');
    }
  }
}
