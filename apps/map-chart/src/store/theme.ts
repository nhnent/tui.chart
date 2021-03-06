import { ActionParams, StoreModule } from '@t/store';

export function getDefaultTheme(globalFontFamily = 'Arial') {
  return {
    colors: [
      '#00a9ff',
      '#ffb840',
      '#ff5a46',
      '#00bd9f',
      '#785fff',
      '#f28b8c',
      '#989486',
      '#516f7d',
      '#28e6eb',
      '#28695f',
      '#96c85a',
      '#45ba3f',
      '#295ba0',
      '#2a4175',
      '#289399',
      '#66c8d3',
      '#617178',
      '#8a9a9a',
      '#bebebe',
      '#374b5a',
      '#64eba0',
      '#ffe155',
      '#ff9141',
      '#af4beb',
      '#ff73fa',
      '#ff55b2',
      '#2869f5',
      '#3296ff',
      '#8cc3ff',
      '#2828b9',
      '#fa8787',
      '#e13782',
      '#7d5aaa',
      '#643c91',
      '#d25f5f',
      '#fabe6e',
      '#c3a9eb',
      '#b9c8f5',
      '#73a0cd',
      '#0f5a8c',
    ],
    startColor: '#ffe98a',
    endColor: '#d74177',
    lineWidth: 1,
    tooltip: {
      background: 'rgba(85, 85, 85, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0)',
      borderWidth: 0,
      borderRadius: 3,
      borderStyle: 'solid',
      body: {
        fontSize: 12,
        fontFamily: `${globalFontFamily}, sans-serif`,
        fontWeight: 'normal',
        color: '#ffffff',
      },
    },
  };
}

const theme: StoreModule = {
  name: 'theme',
  state: () => ({
    theme: getDefaultTheme(),
  }),
  action: {
    initThemeState({ state }: ActionParams) {
      state.theme = getDefaultTheme();
    },
  },
  observe: {
    updateTheme() {
      this.dispatch('initThemeState');
    },
  },
};

export default theme;
