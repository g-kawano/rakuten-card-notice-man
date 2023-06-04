/**
 * Flex メッセージを形成するためのクラス
 * 対応タイプ
 *  - box コンテント
 *  - text コンテント
 *  - separator コンテント
 *
 *  ※ line-bot-sdk-nodejs を使えば不要になるが、GAS で npm install するには一手間必要なのでここで独自実装している
 */

type Size = number | "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "3xl" | "4xl" | "5xl" | "full";
type Margin = number | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

/**
 * Flex メッセージの コンテントの型
 */
export abstract class Content {
  type: string;

  constructor(type: string) {
    this.type = type;
  }
}

/**
 * Box コンテント作成パラメータ型
 */
type BoxContentOptions = {
  type?: string;
  layout: string;
  contents?: Content[];
  backgroundColor?: string;
  margin?: Margin;
  justifyContent?: String;
};

/**
 * Text コンテント作成パラメータ型
 */
type TextContentOptions = {
  type?: string;
  text: string;
  wrap?: boolean;
  align?: string;
  color?: string;
  weight?: string;
  size?: Size;
  flex?: number;
  margin?: Margin;
  decoration?: "underline" | "line-through";
};

/**
 * Image コンテント作成パラメータ型
 */
type ImageContentOptions = {
  type?: string;
  url: string;
  size: Size;
  margin?: Margin;
  align?: string;
};

/**
 * Flex メッセージの セパレート コンテントクラス
 */
export class Separator {
  type: string;
  margin: Margin;

  constructor(margin: Margin) {
    this.type = "separator";
    this.margin = margin;
  }
}

/**
 * Flex メッセージの Filler コンテントクラス
 */
export class Filler {
  type: string;
  flex?: number;

  constructor(flex?: number) {
    this.type = "filler";
    this.flex = flex;
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
  margin?: Margin;
  justifyContent?: String;

  constructor({ layout, backgroundColor, margin, justifyContent }: BoxContentOptions) {
    super("box");
    this.layout = layout;
    this.contents = [];

    if (backgroundColor) this.backgroundColor = backgroundColor;
    if (margin) this.margin = margin;
    if (justifyContent) this.justifyContent = justifyContent;
  }

  /**
   * Box コンテント内にコンテントを追加する
   * @param content コンテント
   * box コンテントの入れ子も可能
   */
  addContent(content: Content) {
    this.contents?.push(content);
  }
}

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
  size?: Size;
  flex?: number;
  margin?: Margin;
  decoration?: "underline" | "line-through";

  constructor({ text, wrap = true, align, color, weight, size, flex, margin, decoration }: TextContentOptions) {
    super("text");
    this.text = text;
    this.wrap = wrap;

    if (align) this.align = align;
    if (color) this.color = color;
    if (weight) this.weight = weight;
    if (size) this.size = size;
    if (flex) this.flex = flex;
    if (margin) this.margin = margin;
    if (decoration) this.margin = margin;
  }
}

/**
 * LINE メッセージの Image 部分をメッセージクラス
 * https://developers.line.biz/ja/reference/messaging-api/#image-message
 */
export class ImageContent extends Content {
  url: string;
  size: Size;
  margin?: Margin;
  align?: string;

  constructor({ url, size, margin, align }: ImageContentOptions) {
    super("image");
    this.url = url;
    this.size = size;

    if (margin) this.margin = margin;
    if (align) this.align = align;
  }
}
