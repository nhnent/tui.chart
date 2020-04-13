import { LineSeriesType } from '@t/options';

export const temperatureData = {
  categories: [
    '01/01/2020',
    '02/01/2020',
    '03/01/2020',
    '04/01/2020',
    '05/01/2020',
    '06/01/2020',
    '07/01/2020',
    '08/01/2020',
    '09/01/2020',
    '10/01/2020',
    '11/01/2020',
    '12/01/2020'
  ],
  series: [
    {
      name: 'Seoul',
      data: [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6]
    },
    {
      name: 'Seattle',
      data: [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.4, 3.7]
    },
    {
      name: 'Sydney',
      data: [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6, 19.4, 21.2]
    },
    {
      name: 'Moskva',
      data: [-10.3, -9.1, -4.1, 4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2, -2.0, -7.5]
    },
    {
      name: 'Jungfrau',
      data: [-13.2, -13.7, -13.1, -10.3, -6.1, -3.2, 0.0, -0.1, -1.8, -4.5, -9.0, -10.9]
    }
  ]
};

export const budgetData = {
  categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 6000, 3000, 6000, 4000]
    },
    {
      name: 'Income',
      data: [8000, 1000, 7000, 2000, 5000, 3000]
    },
    {
      name: 'Outgo',
      data: [900, 6000, 1000, 9000, 3000, 1000]
    }
  ]
};

export const tupleCoordinateData = {
  series: [
    {
      name: 'SiteA',
      data: [
        [1, 202],
        [2, 212],
        [3, 222],
        [4, 351],
        [5, 412],
        [6, 420],
        [7, 300],
        [8, 213],
        [9, 230],
        [10, 220],
        [11, 234],
        [12, 210],
        [13, 220]
      ]
    },
    {
      name: 'SiteB',
      data: [
        [1, 312],
        [3, 320],
        [5, 295],
        [7, 300],
        [9, 320],
        [11, 30],
        [13, 20]
      ]
    }
  ] as LineSeriesType[]
};

export const coordinateData = {
  series: [
    {
      name: 'SiteA',
      data: [
        { x: 1, y: 202 },
        { x: 2, y: 212 },
        { x: 3, y: 222 },
        { x: 4, y: 351 },
        { x: 5, y: 412 },
        { x: 6, y: 420 },
        { x: 7, y: 300 },
        { x: 8, y: 213 },
        { x: 9, y: 230 },
        { x: 10, y: 220 },
        { x: 11, y: 234 },
        { x: 12, y: 210 },
        { x: 13, y: 220 }
      ]
    },
    {
      name: 'SiteB',
      data: [
        { x: 1, y: 312 },
        { x: 3, y: 320 },
        { x: 5, y: 295 },
        { x: 7, y: 300 },
        { x: 9, y: 320 },
        { x: 11, y: 30 },
        { x: 13, y: 20 }
      ]
    }
  ]
};

export const datetimeCoordinateData = {
  series: [
    {
      name: 'SiteA',
      data: [
        ['08/22/2020 10:00:00', 202],
        ['08/22/2020 10:05:00', 212],
        ['08/22/2020 10:10:00', 222],
        ['08/22/2020 10:15:00', 351],
        ['08/22/2020 10:20:00', 412],
        ['08/22/2020 10:25:00', 420],
        ['08/22/2020 10:30:00', 300],
        ['08/22/2020 10:35:00', 213],
        ['08/22/2020 10:40:00', 230],
        ['08/22/2020 10:45:00', 220],
        ['08/22/2020 10:50:00', 234],
        ['08/22/2020 10:55:00', 210],
        ['08/22/2020 11:00:00', 220]
      ]
    },
    {
      name: 'SiteB',
      data: [
        ['08/22/2020 10:00:00', 312],
        ['08/22/2020 10:10:00', 320],
        ['08/22/2020 10:20:00', 295],
        ['08/22/2020 10:30:00', 300],
        ['08/22/2020 10:40:00', 320],
        ['08/22/2020 10:50:00', 30],
        ['08/22/2020 11:00:00', 20]
      ]
    }
  ] as LineSeriesType[]
};
