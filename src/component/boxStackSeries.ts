import BoxSeries, { SeriesRawData } from './boxSeries';
import { StackInfo, ColumnChartOptions, BarChartOptions } from '@t/options';
import {
  ChartState,
  StackSeriesData,
  StackGroupData,
  StackDataType,
  StackData,
  BoxType
} from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { BoxSeriesModel } from '@t/components/series';
import { first, last } from '@src/helpers/utils';

interface StackSeriesModelParamType {
  stackData: StackData;
  colors: string[];
  valueLabels: string[];
  tickDistance: number;
  stackGroupCount?: number;
  stackGroupIndex?: number;
}

function isGroupStack(rawData: StackDataType): rawData is StackGroupData {
  return !Array.isArray(rawData);
}

export default class BoxStackSeries extends BoxSeries {
  stack!: StackInfo;

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, theme, axes, categories, stackSeries } = chartState;

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);
    this.stack = stackSeries[this.name]!.stack!;

    const { colors } = theme.series;
    const seriesData = stackSeries[this.name] as StackSeriesData<BoxType>;

    const valueLabels = axes[this.valueAxis].labels;
    const tickDistance = this.getTickDistance(axes[this.labelAxis].validTickCount);

    const seriesModels: BoxSeriesModel[] = this.renderSeriesModel(
      seriesData,
      colors,
      valueLabels,
      tickDistance
    );

    const tooltipData: TooltipData[] = this.getTooltipData(seriesData, colors, categories);

    const rectModel = super.renderRect(seriesModels);

    this.models = [super.renderClipRectAreaModel(), ...seriesModels];

    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  renderSeriesModel(
    seriesData: StackSeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number
  ) {
    const stackData = seriesData.stackData;

    return isGroupStack(stackData)
      ? this.makeStackGroupSeriesModel(seriesData, [...colors], valueLabels, tickDistance)
      : this.makeStackSeriesModel({ stackData, colors, valueLabels, tickDistance });
  }

  makeStackSeriesModel({
    stackData,
    colors,
    valueLabels,
    tickDistance,
    stackGroupCount = 1,
    stackGroupIndex = 0
  }: StackSeriesModelParamType): BoxSeriesModel[] {
    const seriesModels: BoxSeriesModel[] = [];
    const offsetAxisLength = this.plot[this.offsetSizeKey];
    const columnWidth = (tickDistance - this.padding * 2) / stackGroupCount;
    const stackType = this.stack.type;

    stackData.forEach(({ values, sum }, index) => {
      const seriesPos =
        index * tickDistance + this.padding + columnWidth * stackGroupIndex + this.hoverThickness;

      values.forEach((value, seriesIndex) => {
        const color = colors[seriesIndex];
        const beforeValueSum = super.getTotalOfPrevValues(values, seriesIndex, !this.isBar);
        let barLength, startPosition;

        if (stackType === 'percent') {
          barLength = (value / sum) * offsetAxisLength;
          startPosition = (beforeValueSum / sum) * offsetAxisLength;
        } else {
          const offsetValue = Number(last(valueLabels)) - Number(first(valueLabels));
          const axisValueRatio = offsetAxisLength / offsetValue;

          barLength = value * axisValueRatio;
          startPosition = beforeValueSum * axisValueRatio;
        }

        seriesModels.push({
          type: 'box',
          color,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? startPosition + this.hoverThickness + this.axisThickness : seriesPos,
          y: this.isBar ? seriesPos : offsetAxisLength - startPosition + this.hoverThickness
        });
      });
    });

    return seriesModels;
  }

  makeStackGroupSeriesModel(
    seriesRaw: StackSeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number
  ): BoxSeriesModel[] {
    const stackGroupData = seriesRaw.stackData as StackGroupData;
    const seriesRawData = seriesRaw.data;
    const stackGroupIds = Object.keys(stackGroupData);
    let seriesModels: BoxSeriesModel[] = [];

    stackGroupIds.forEach((groupId, groupIndex) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);

      seriesModels = [
        ...seriesModels,
        ...this.makeStackSeriesModel({
          stackData: stackGroupData[groupId],
          colors: colors.splice(groupIndex, filtered.length),
          valueLabels,
          tickDistance,
          stackGroupCount: stackGroupIds.length,
          stackGroupIndex: groupIndex
        })
      ];
    });

    return seriesModels;
  }

  private getTooltipData(
    seriesData: StackSeriesData<BoxType>,
    colors: string[],
    categories?: string[]
  ) {
    const seriesRawData = seriesData.data;
    const stackData = seriesData.stackData!;

    return isGroupStack(stackData)
      ? this.makeGroupStackTooltipData(seriesRawData, stackData, colors, categories)
      : this.makeStackTooltipData(seriesRawData, stackData, colors, categories);
  }

  private makeGroupStackTooltipData(
    seriesRawData: SeriesRawData,
    stackData: StackGroupData,
    colors: string[],
    categories?: string[]
  ) {
    return Object.keys(stackData).flatMap((groupId, groupIdx) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const groupColors = colors.splice(groupIdx, filtered.length);

      return this.makeStackTooltipData(seriesRawData, stackData[groupId], groupColors, categories);
    });
  }

  private makeStackTooltipData(
    seriesRawData: SeriesRawData,
    stackData: StackData,
    colors: string[],
    categories?: string[]
  ) {
    return stackData.flatMap(({ values }, index) =>
      values.map((value, seriesIndex) => ({
        label: seriesRawData[seriesIndex].name,
        color: colors[seriesIndex],
        value,
        category: categories?.[index]
      }))
    );
  }
}
