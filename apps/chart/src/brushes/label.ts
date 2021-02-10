import { makeStyleObj, fillStyle, strokeWithOptions } from '@src/helpers/style';
import { isNumber, includes } from '@src/helpers/utils';
import { rgba } from '@src/helpers/color';
import { Point } from '@t/options';
import { RectStyle, StyleProp, Nullable } from '@t/components/series';
import {
  BubbleLabelModel,
  LabelModel,
  StrokeLabelStyle,
  StrokeLabelStyleName,
  LabelStyle,
  LabelStyleName,
  PathRectStyleName,
} from '@t/brush/label';

export const DEFAULT_LABEL_TEXT = 'normal 11px Arial';

export const labelStyle = {
  default: {
    font: DEFAULT_LABEL_TEXT,
    fillStyle: '#333333',
    textAlign: 'left',
    textBaseline: 'middle',
  },
  title: {
    textBaseline: 'top',
  },
  axisTitle: {
    textBaseline: 'top',
  },
  rectLabel: {
    font: DEFAULT_LABEL_TEXT,
    fillStyle: 'rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    textBaseline: 'middle',
  },
};

export const strokeLabelStyle = {
  none: {
    lineWidth: 1,
    strokeStyle: 'rgba(255, 255, 255, 0)',
  },
  stroke: {
    lineWidth: 4,
    strokeStyle: 'rgba(255, 255, 255, 0.5)',
  },
};

export function label(ctx: CanvasRenderingContext2D, labelModel: LabelModel) {
  const { x, y, text, style, stroke, opacity, radian, rotationPosition } = labelModel;

  if (style) {
    const styleObj = makeStyleObj<LabelStyle, LabelStyleName>(style, labelStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] =
        key === 'fillStyle' && isNumber(opacity) ? rgba(styleObj[key]!, opacity) : styleObj[key];
    });
  }

  ctx.save();

  if (radian) {
    ctx.translate(rotationPosition?.x ?? x, rotationPosition?.y ?? y);
    ctx.rotate(radian);
    ctx.translate(-(rotationPosition?.x ?? x), -(rotationPosition?.y ?? y));
  }

  if (stroke) {
    const strokeStyleObj = makeStyleObj<StrokeLabelStyle, StrokeLabelStyleName>(
      stroke,
      strokeLabelStyle
    );
    const strokeStyleKeys = Object.keys(strokeStyleObj);

    strokeStyleKeys.forEach((key) => {
      ctx[key] =
        key === 'strokeStyle' && isNumber(opacity)
          ? rgba(strokeStyleObj[key]!, opacity)
          : strokeStyleObj[key];
    });

    if (strokeStyleKeys.length) {
      ctx.strokeText(text, x, y);
    }
  }

  ctx.fillText(text, x, y);
  ctx.restore();
}

const textBubbleStyle = {
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffsetY: 2,
    shadowBlur: 4,
  },
};

export function bubbleLabel(ctx: CanvasRenderingContext2D, model: BubbleLabelModel) {
  const {
    radian = 0,
    bubble: {
      x,
      y,
      width,
      height,
      radius = 0,
      lineWidth = 1,
      align = 'center',
      direction,
      points = [],
      fill = '#fff',
      strokeStyle = 'rgba(0, 0, 0, 0)',
      style = null,
      textBaseline = 'middle',
    },
  } = model;

  let rotationXPos = x;
  let rotationYPos = y;

  if (align === 'center') {
    rotationXPos = x + width / 2;
  } else if (includes(['right', 'end'], align)) {
    rotationXPos = x + width;
  }

  if (textBaseline === 'middle') {
    rotationYPos = y + height / 2;
  } else if (textBaseline === 'bottom') {
    rotationYPos = y + height;
  }

  if (width > 0 && height > 0) {
    drawBubble(ctx, {
      x,
      y,
      radius,
      width,
      height,
      style,
      fill,
      strokeStyle,
      lineWidth,
      direction,
      points,
      radian,
      rotationPosition: {
        x: rotationXPos,
        y: rotationYPos,
      },
    });
  }

  if (model.label.text) {
    const {
      x: labelX,
      y: labelY,
      text,
      textAlign = 'center',
      textBaseline: labelBaseline = 'middle',
      font,
      color,
      strokeStyle: labelStrokeColor = 'rgba(0, 0, 0, 0)',
    } = model.label;

    ctx.shadowColor = 'rgba(0, 0, 0, 0)';

    label(ctx, {
      type: 'label',
      x: labelX,
      y: labelY,
      text,
      style: [{ font, fillStyle: color, textAlign, textBaseline: labelBaseline }] as StyleProp<
        LabelStyle,
        LabelStyleName
      >,
      stroke: [{ strokeStyle: labelStrokeColor }],
      radian,
      rotationPosition: {
        x: rotationXPos,
        y: rotationYPos,
      },
    });
  }
}

type BubbleModel = {
  radius?: number;
  width: number;
  height: number;
  style: Nullable<StyleProp<RectStyle, PathRectStyleName>>;
  stroke?: string;
  fill?: string;
  lineWidth?: number;
  points?: Point[];
  direction?: string;
  strokeStyle?: string;
  radian?: number;
  rotationPosition?: Point;
} & Point;

function drawBubbleArrow(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (!points.length) {
    return;
  }

  ctx.lineTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
}

function getRotationPostion(defaultX: number, defaultY: number, rotationPosition?: Point) {
  return {
    rotationPosX: rotationPosition?.x ?? defaultX,
    rotationPosY: rotationPosition?.y ?? defaultY,
  };
}

function drawBubble(ctx: CanvasRenderingContext2D, model: BubbleModel) {
  const {
    x,
    y,
    width,
    height,
    style,
    radius = 0,
    strokeStyle,
    fill,
    lineWidth = 1,
    points = [],
    direction = '',
    radian,
    rotationPosition,
  } = model;

  const right = x + width;
  const bottom = y + height;

  ctx.beginPath();
  ctx.save();

  const { rotationPosX, rotationPosY } = getRotationPostion(x, y, rotationPosition);

  if (radian) {
    ctx.translate(rotationPosX, rotationPosY);
    ctx.rotate(radian);
    ctx.translate(-rotationPosX, -rotationPosY);
  }

  ctx.moveTo(x + radius, y);

  if (direction === 'top') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(right - radius, y);
  ctx.quadraticCurveTo(right, y, right, y + radius);

  if (direction === 'right') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(right, y + height - radius);
  ctx.quadraticCurveTo(right, bottom, right - radius, bottom);

  if (direction === 'bottom') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(x + radius, bottom);
  ctx.quadraticCurveTo(x, bottom, x, bottom - radius);

  if (direction === 'left') {
    drawBubbleArrow(ctx, points);
  }

  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);

  if (style) {
    const styleObj = makeStyleObj<RectStyle, PathRectStyleName>(style, textBubbleStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  if (fill) {
    fillStyle(ctx, fill);
  }

  if (strokeStyle) {
    strokeWithOptions(ctx, { strokeStyle, lineWidth });
  }

  ctx.restore();
}
