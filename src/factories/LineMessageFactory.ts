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
  static create(properties: Omit<FlexBox, "type" | "contents">): BoxContent {
    return new BoxContent(properties);
  }
}

export class TextContentFactory {
  static create(properties: TextContentProperties): TextContent {
    return new TextContent(properties);
  }
}

export class ImageContentFactory {
  static create(properties: Omit<FlexImage, "type">): ImageContent {
    return new ImageContent(properties);
  }
}

export class SeparatorContentFactory {
  static create(margin: FlexSeparator["margin"]): SeparatorContent {
    return new SeparatorContent(margin);
  }
}

export class FillerContentFactory {
  static create(flex?: FlexFiller["flex"]): FillerContent {
    return new FillerContent(flex);
  }
}
