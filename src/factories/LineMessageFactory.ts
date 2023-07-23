import { FlexBox, FlexImage, FlexSeparator, FlexFiller } from "@line/bot-sdk";
import {
  BoxContent,
  TextContent,
  ImageContent,
  SeparatorContent,
  FillerContent,
  TextContentProperties
} from "@/libs/Line/02LineMessage";

export class BoxContentFactory {
  /**
   * BoxContent インスタンスを作成する
   * @param properties BoxContent のプロパティ
   */
  static create(properties: Omit<FlexBox, "type" | "contents">): BoxContent {
    return new BoxContent(properties);
  }
}

export class TextContentFactory {
  /**
   * TextContent インスタンスを作成する
   * @param properties TextContent のプロパティ
   */
  static create(properties: TextContentProperties): TextContent {
    return new TextContent(properties);
  }
}

export class ImageContentFactory {
  /**
   * ImageContent インスタンスを作成する
   * @param properties ImageContent のプロパティ
   */
  static create(properties: Omit<FlexImage, "type">): ImageContent {
    return new ImageContent(properties);
  }
}

export class SeparatorContentFactory {
  /**
   * SeparatorContent インスタンスを作成する
   * @param margin margin の値
   */
  static create(margin: FlexSeparator["margin"]): SeparatorContent {
    return new SeparatorContent(margin);
  }
}

export class FillerContentFactory {
  /**
   * FillerContent インスタンスを作成する
   * @param flex flex の値
   */
  static create(flex?: FlexFiller["flex"]): FillerContent {
    return new FillerContent(flex);
  }
}
