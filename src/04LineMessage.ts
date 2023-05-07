type BoxContentOptions = {
  type?: string;
  layout: string;
  contents?: Content[];
  backgroundColor?: string;
  margin?: string;
  justifyContent?: String;
};

abstract class Content {
  type: string;

  constructor(type: string) {
    this.type = type;
  }
}

/**
 * LINE メッセージの Box 部分をメッセージクラス
 * https://developers.line.biz/ja/reference/messaging-api/#box
 */
export class BoxContent extends Content {
  layout: string;
  contents?: Content[];
  backgroundColor?: string;
  margin?: string;
  justifyContent?: String;

  constructor({ layout, backgroundColor, margin, justifyContent }: BoxContentOptions) {
    super("box");
    this.layout = layout;
    this.contents = [];

    if (backgroundColor) this.backgroundColor = backgroundColor;
    if (margin) this.margin = margin;
    if (justifyContent) this.justifyContent = justifyContent;
  }

  addContent(content: Content) {
    this.contents?.push(content);
  }
}

type TextContentOptions = {
  type?: string;
  text: string;
  wrap?: boolean;
  align?: string;
  color?: string;
  weight?: string;
  size?: string;
  flex?: number;
  margin?: string;
};

/**
 * LINE メッセージの Text 部分をメッセージクラス
 * https://developers.line.biz/ja/reference/messaging-api/#text-message
 */
export class TextContent extends Content {
  text: string;
  wrap: boolean;
  align?: string;
  color?: string;
  weight?: string;
  size?: string;
  flex?: number;
  margin?: string;

  constructor({ text, wrap = true, align, color, weight, size, flex, margin }: TextContentOptions) {
    super("text");
    this.text = text;
    this.wrap = wrap;

    if (align) this.align = align;
    if (color) this.color = color;
    if (weight) this.weight = weight;
    if (size) this.size = size;
    if (flex) this.flex = flex;
    if (margin) this.margin = margin;
  }
}

export class Saparator {
  type: string;
  margin: string;

  constructor(margin: string) {
    this.type = "separator";
    this.margin = margin;
  }
}
