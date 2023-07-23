import { BoxContentFactory, TextContentFactory, ImageContentFactory, SeparatorContentFactory, FillerContentFactory } from "@/factories/LineMessageFactory";

describe("FlexContentClasses", () => {
  describe("BoxContent", () => {
    it("should construct and add content correctly", () => {
      const boxContent = BoxContentFactory.create({ layout: "vertical", backgroundColor: "#FFFFFF" });
      const textContent = TextContentFactory.create({ text: "Hello" });

      boxContent.addContent(textContent.textContent);

      expect(boxContent.boxContent).toEqual({
        type: "box",
        layout: "vertical",
        backgroundColor: "#FFFFFF",
        contents: [textContent.textContent],
      });
    });
  });

  describe("TextContent", () => {
    it("should construct correctly", () => {
      const textContent = TextContentFactory.create({ text: "Hello", align: "center" });
      expect(textContent.textContent).toEqual({
        type: "text",
        text: "Hello",
        wrap: true,
        align: "center",
      });
    });
  });

  describe("ImageContent", () => {
    it("should construct correctly", () => {
      const imageContent = ImageContentFactory.create({ url: "https://example.com/image.jpg", size: "full" });
      expect(imageContent).toEqual({
        type: "image",
        url: "https://example.com/image.jpg",
        size: "full",
      });
    });
  });

  describe("SeparatorContent", () => {
    it("should construct correctly", () => {
      const separatorContent = SeparatorContentFactory.create("md");
      expect(separatorContent).toEqual({
        type: "separator",
        margin: "md",
      });
    });
  });

  describe("FillerContent", () => {
    it("should construct correctly", () => {
      const fillerContent = FillerContentFactory.create(1);
      expect(fillerContent).toEqual({
        type: "filler",
        flex: 1,
      });
    });
  });
});
