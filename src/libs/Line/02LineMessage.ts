/**
 * Flex メッセージを形成するためのクラス郡
 */

import { FlexBox, FlexComponent, FlexImage, FlexSeparator, FlexText, FlexFiller } from "@line/bot-sdk";

/**
 * LINE メッセージの Box 部分をメッセージクラス
 * https://developers.line.biz/ja/reference/messaging-api/#box
 */
export class BoxContent {
  boxContent: FlexBox;

  // 必要なものだけインターフェースとして提供する
  constructor({ layout, backgroundColor, margin, justifyContent }: Omit<FlexBox, "type" | "contents">) {
    this.boxContent = {
      type: "box",
      layout: layout,
      contents: [],
      backgroundColor: backgroundColor,
      margin: margin,
      justifyContent: justifyContent,
    };
  }

  /**
   * Box コンテント内にコンテントを追加する
   * @param content コンテント
   * box コンテントの入れ子も可能
   */
  addContent(content: FlexComponent) {
    this.boxContent.contents?.push(content);
  }
}

type TextContentProperties = {
  text: string;
  wrap?: boolean;
  align?: "start" | "end" | "center";
  color?: string;
  weight?: "regular" | "bold";
  size?: string | "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "3xl" | "4xl" | "5xl";
  flex?: number;
  margin?: string | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  decoration?: string;
};

/**
 * LINE メッセージの Text 部分をメッセージクラス
 * https://developers.line.biz/ja/reference/messaging-api/#text-message
 * インプリできる型情報がなかったので、自前で定義
 */
export class TextContent {
  textContent: FlexText;
  constructor({ text, wrap = true, align, color, weight, size, flex, margin, decoration }: TextContentProperties) {
    this.textContent = {
      type: "text",
      text: text,
      wrap: wrap,
      flex: flex,
      align: align,
      color: color,
      weight: weight,
      size: size,
      margin: margin,
      decoration: decoration,
    };
  }
}

/**
 * LINE メッセージの Image 部分をメッセージクラス
 * https://developers.line.biz/ja/reference/messaging-api/#image-message
 */
export class ImageContent implements Omit<FlexImage, "type"> {
  type: FlexImage["type"];
  url: FlexImage["url"];
  size: FlexImage["size"];
  margin?: FlexImage["margin"];
  align?: FlexImage["align"];

  constructor({ url, size, margin, align }: Omit<FlexImage, "type">) {
    this.type = "image";
    this.url = url;
    this.size = size;
    this.margin = margin;
    this.align = align;
  }
}

/**
 * Flex メッセージの セパレート コンテントクラス
 */
export class SeparatorContent implements FlexSeparator {
  type: FlexSeparator["type"];
  margin: FlexSeparator["margin"];

  constructor(margin: FlexSeparator["margin"]) {
    this.type = "separator";
    this.margin = margin;
  }
}

/**
 * Flex メッセージの セパレート コンテントクラス
 */
export class FillerContent implements FlexFiller {
  type: FlexFiller["type"];
  flex?: FlexFiller["flex"];

  constructor(flex?: FlexFiller["flex"]) {
    this.type = "filler";
    this.flex = flex;
  }
}
