import { BoxContent, TextContent, ImageContent, SeparatorContent, FillerContent } from "@/libs/Line/02LineMessage";

describe("FlexContentClasses", () => {
  describe("BoxContent", () => {
    it("should construct and add content correctly", () => {
      const boxContent = new BoxContent({ layout: "vertical", backgroundColor: "#FFFFFF" });
      const textContent = new TextContent({ text: "Hello" });

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
      const textContent = new TextContent({ text: "Hello", align: "center" });
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
      const imageContent = new ImageContent({ url: "https://example.com/image.jpg", size: "full" });
      expect(imageContent).toEqual({
        type: "image",
        url: "https://example.com/image.jpg",
        size: "full",
      });
    });
  });

  describe("SeparatorContent", () => {
    it("should construct correctly", () => {
      const separatorContent = new SeparatorContent("md");
      expect(separatorContent).toEqual({
        type: "separator",
        margin: "md",
      });
    });
  });

  describe("FillerContent", () => {
    it("should construct correctly", () => {
      const fillerContent = new FillerContent(1);
      expect(fillerContent).toEqual({
        type: "filler",
        flex: 1,
      });
    });
  });
});
