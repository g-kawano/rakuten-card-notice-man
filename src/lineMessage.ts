type BoxContentOptions = {
  type?: string;
  layout: string;
  contents?: BoxContent[] | TextContent[];
  backgroundColor?: string;
  margin?: string;
  justifyContent?: String;
};

/**
 * LINE メッセージの Box 部分をメッセージクラス
 * https://developers.line.biz/ja/reference/messaging-api/#box
 */
export class BoxContent {
  type: string;
  layout: string;
  contents?: BoxContent[] | TextContent[];
  backgroundColor?: string;
  margin?: string;
  justifyContent?: String;

  constructor({ layout, backgroundColor, margin, justifyContent }: BoxContentOptions) {
    this.type = "box";
    this.layout = layout;
    this.contents = [];

    if (backgroundColor) this.backgroundColor = backgroundColor;
    if (margin) this.margin = margin;
    if (justifyContent) this.justifyContent = justifyContent;
  }

  // TODO: ここの any を何とかしたい
  // BoxContent[] | TextContent[] としてもエラーになる
  // おそらく、contents=BoxContent[]　の時に、addContent(TextContent)ができてしまうからなんだけど
  addContent(content: any) {
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
export class TextContent {
  type: string;
  text: string;
  wrap: boolean;
  align?: string;
  color?: string;
  weight?: string;
  size?: string;
  flex?: number;
  margin?: string;

  constructor({ type = "text", text, wrap = true, align, color, weight, size, flex, margin }: TextContentOptions) {
    this.type = type;
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
