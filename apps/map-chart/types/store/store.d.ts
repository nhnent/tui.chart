export interface ChartProps {
  el: HTMLElement;
  series: Series;
  modules?: StoreModule[];
  options: Options;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Rect = Point & Size;

export interface Layout {
  chart: Rect;
  xAxis: Rect;
  yAxis: Rect;
  xAxisTitle: Rect;
  yAxisTitle: Rect;
  plot: Rect;
  legend: Rect;
  circleLegend: Rect;
  title: Rect;
  exportMenu: Rect;
  resetButton: Rect;
  secondaryYAxisTitle: Rect;
  secondaryYAxis: Rect;
  circularAxisTitle: Rect;
}

export interface StoreModule extends StoreOptions {
  name: 'root';
}

export interface ChartState {
  chart: ChartOptions;
  layout: Layout;
  options: Options;
}

interface Series {
  name: string;
  data: string[];
}

interface ChartOptions {
  width: number;
  height: number;
}

interface Options {
  chart: ChartOptions;
}

interface InitStoreState {
  series: Series;
  options: Options;
}

type StateFunc = (initStoreState: InitStoreState) => Partial<ChartState<Options>>;
type ActionFunc = (store: Store<Options>, ...args: any[]) => void;
type ComputedFunc = (state: ChartState<Options>, computed: Record<string, any>) => any;
export type ObserveFunc = (state: ChartState<Options>, computed: Record<string, any>) => void;
type WatchFunc = (value: any) => void;

export interface StoreOptions {
  state?: Partial<ChartState<Options>> | StateFunc;
  watch?: Record<string, WatchFunc>;
  computed?: Record<string, ComputedFunc>;
  action?: Record<string, ActionFunc> & ThisType<Store<Options>>;
  observe?: Record<string, ObserveFunc> & ThisType<Store<Options>>;
}

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

declare class Store {
  state: ChartState;

  initStoreState: InitStoreState;

  computed: Record<string, any>;

  actions: Record<string, ActionFunc>;

  setRootState(state: Partial<ChartState<T>>): void;

  setComputed(namePath: string, fn: ComputedFunc, holder: any): void;

  setWatch(namePath: string, fn: WatchFunc): Function | null;

  setAction(name: string, fn: ActionFunc): void;

  dispatch(name: string, payload?: any, isInvisible?: boolean): void;

  observe(fn: ObserveFunc): Function;

  observable(target: Record<string, any>): Record<string, any>;

  notifyByPath(namePath: string): void;

  notify<T extends Record<string, any>, K extends keyof T>(target: T, key: K): void;

  setModule(name: string | StoreModule, param?: StoreOptions | StoreModule): void;

  setValue(target: Record<string, any>, key: string, source: Record<string, any>): void;
}