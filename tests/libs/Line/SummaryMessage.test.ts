import { SummaryMessage } from "@/libs/Line/04SummaryMessage";
import { Setting } from "@/00Setting";
import { FixedCostSheet } from "@/libs/SpreadSheet/05FixedCostSheet";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";
import { FlexBox } from "@line/bot-sdk";
import { PieChartSheet } from "@/libs/SpreadSheet/04PieChartSheet";
import { Dependencies, SummaryMessageFactory } from "@/factories/SummaryMessageFactory";

jest.mock("@/00Setting");
jest.mock("@/libs/SpreadSheet/01SpreadSheet");
jest.mock("@/libs/SpreadSheet/02PaymentHistorySheet");
jest.mock("@/libs/SpreadSheet/05FixedCostSheet");
jest.mock("@/libs/SpreadSheet/04PieChartSheet");

describe("SummaryMessage", () => {
  let mockDependencies: Dependencies;
  let summaryMessage: SummaryMessage;
  let setting: Setting;

  beforeEach(() => {
    const targetYear = "2023";
    const targetMonth = "5";

    setting = new Setting() as jest.Mocked<Setting>;
    setting.MASTER_SPREAD_SHEET_FILE = "dummy";

    const dummySheetFile = "dummy" as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
    const dummySheet = "dummy" as unknown as GoogleAppsScript.Spreadsheet.Sheet;

    mockDependencies = new Dependencies(targetYear, targetMonth, setting, "dummy", "dummy");
    mockDependencies.fixedCostSheet = new FixedCostSheet(dummySheetFile, dummySheet);
    mockDependencies.paymentHistorySheet = new PaymentHistorySheet(dummySheetFile, dummySheet);
    mockDependencies.previousPaymentHistorySheet = new PaymentHistorySheet(dummySheetFile, dummySheet);
    mockDependencies.pieChartSheet = new PieChartSheet(dummySheetFile, dummySheet);

    summaryMessage = SummaryMessageFactory.create(mockDependencies);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("constructor", () => {
    it("should initialize the instance correctly", () => {
      expect(summaryMessage).toBeInstanceOf(SummaryMessage);
      expect(summaryMessage.targetYear).toBe("2023");
      expect(summaryMessage.targetMonth).toBe("5");
      expect(summaryMessage.fixedCostSheet).toBeInstanceOf(FixedCostSheet);
      expect(summaryMessage.paymentHistorySheet).toBeInstanceOf(PaymentHistorySheet);
      expect(summaryMessage.previousPaymentHistorySheet).toBeInstanceOf(PaymentHistorySheet);
      expect(summaryMessage.pieChartSheet).toBeInstanceOf(PieChartSheet);
    });
  });

  describe("buildSendMessage", () => {
    it("should return correct send message object", () => {
      jest.spyOn(summaryMessage, "buildHeaderContent").mockReturnValue("headerMock" as unknown as FlexBox);
      jest.spyOn(summaryMessage, "buildBodyContent").mockReturnValue("bodyMock" as unknown as FlexBox);

      const result = summaryMessage.buildSendMessage();

      expect(result).toMatchObject({
        type: "flex",
        altText: "サマリーメッセージ",
        contents: {
          type: "bubble",
          header: "headerMock",
          body: "bodyMock"
        }
      });
    });
  });

  describe("buildHeaderContent", () => {
    it("should return correct header object", () => {
      const result = summaryMessage.buildHeaderContent();

      expect(result).toMatchSnapshot();
    });
  });

  describe("buildBodyContent", () => {
    it("should return correct body object", () => {
      mockDependencies.paymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2000)
        };
      })() as PaymentHistorySheet;
      mockDependencies.previousPaymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2000)
        };
      })() as PaymentHistorySheet;
      mockDependencies.fixedCostSheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2000),
          scanRecord: jest.fn(() => [
            ["固定費1", 1000],
            ["固定費2", 200],
            ["固定費3", 0]
          ])
        };
      })() as FixedCostSheet;
      mockDependencies.pieChartSheet = jest.fn().mockImplementation(() => {
        return {
          uploadChart: jest.fn(),
          downloadChartUrl: jest.fn(() => "https://dummy.com")
        };
      })() as PieChartSheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.buildBodyContent();

      expect(result).toMatchSnapshot();
    });
  });

  describe("buildSpendingContent", () => {
    it("should return correct spending content object", () => {
      mockDependencies.paymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2000)
        };
      })() as PaymentHistorySheet;
      mockDependencies.previousPaymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2000)
        };
      })() as PaymentHistorySheet;
      mockDependencies.fixedCostSheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2000)
        };
      })() as FixedCostSheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.buildSpendingContent();

      expect(result).toHaveProperty("type", "box");
      expect(result).toHaveProperty("layout", "horizontal");

      expect(result.contents[0]).toHaveProperty("type", "text");
      expect(result.contents[0]).toHaveProperty("text", "支出：");
      expect(result.contents[0]).toHaveProperty("wrap", true);
      expect(result.contents[0]).toHaveProperty("size", "md");
      expect(result.contents[0]).toHaveProperty("flex", 4);
      expect(result.contents[0]).toHaveProperty("weight", "bold");

      expect(result.contents[1]).toHaveProperty("type", "text");
      expect(result.contents[1]).toHaveProperty("text", "¥ 4,000");
      expect(result.contents[1]).toHaveProperty("wrap", true);
      expect(result.contents[1]).toHaveProperty("size", "md");
      expect(result.contents[1]).toHaveProperty("flex", 5);
      expect(result.contents[1]).toHaveProperty("weight", "bold");
      expect(result.contents[1]).toHaveProperty("align", "end");
    });
  });

  describe("calcPreviousMonthAmountComparison", () => {
    it("should return correct amount comparison positive value", () => {
      mockDependencies.paymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 10000)
        };
      })() as PaymentHistorySheet;
      mockDependencies.previousPaymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2500)
        };
      })() as PaymentHistorySheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.calcPreviousMonthAmountComparison();

      expect(result).toBe(7500);
    });

    it("should return correct amount comparison negative value", () => {
      mockDependencies.paymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2500)
        };
      })() as PaymentHistorySheet;
      mockDependencies.previousPaymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 10000)
        };
      })() as PaymentHistorySheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.calcPreviousMonthAmountComparison();

      expect(result).toBe(-7500);
    });
  });

  describe("buildPreviousMonthAmountComparison", () => {
    it("should return correct amount comparison content when calc result positive value", () => {
      mockDependencies.paymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 10000)
        };
      })() as PaymentHistorySheet;
      mockDependencies.previousPaymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2500)
        };
      })() as PaymentHistorySheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.buildPreviousMonthAmountComparison();

      expect(result).toHaveProperty("type", "box");
      expect(result).toHaveProperty("layout", "horizontal");
      expect(result).toHaveProperty("margin", "md");

      expect(result.contents[0]).toHaveProperty("type", "filler");

      expect(result.contents[1]).toHaveProperty("type", "text");
      expect(result.contents[1]).toHaveProperty("text", "前月比");
      expect(result.contents[1]).toHaveProperty("wrap", true);
      expect(result.contents[1]).toHaveProperty("flex", 4);
      expect(result.contents[1]).toHaveProperty("weight", "bold");
      expect(result.contents[1]).toHaveProperty("size", "md");

      expect(result.contents[2]).toHaveProperty("type", "text");
      expect(result.contents[2]).toHaveProperty("text", "↑ ¥ 7,500");
      expect(result.contents[2]).toHaveProperty("wrap", true);
      expect(result.contents[2]).toHaveProperty("flex", 5);
      expect(result.contents[2]).toHaveProperty("weight", "bold");
      expect(result.contents[2]).toHaveProperty("size", "md");
      expect(result.contents[2]).toHaveProperty("align", "end");
      expect(result.contents[2]).toHaveProperty("color", "#FF0000");
    });

    it("should return correct amount comparison content when calc result negative value", () => {
      mockDependencies.paymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2500)
        };
      })() as PaymentHistorySheet;
      mockDependencies.previousPaymentHistorySheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 10000)
        };
      })() as PaymentHistorySheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.buildPreviousMonthAmountComparison();

      expect(result).toHaveProperty("type", "box");
      expect(result).toHaveProperty("layout", "horizontal");
      expect(result).toHaveProperty("margin", "md");

      expect(result.contents[0]).toHaveProperty("type", "filler");

      expect(result.contents[1]).toHaveProperty("type", "text");
      expect(result.contents[1]).toHaveProperty("text", "前月比");
      expect(result.contents[1]).toHaveProperty("wrap", true);
      expect(result.contents[1]).toHaveProperty("flex", 4);
      expect(result.contents[1]).toHaveProperty("weight", "bold");
      expect(result.contents[1]).toHaveProperty("size", "md");

      expect(result.contents[2]).toHaveProperty("type", "text");
      expect(result.contents[2]).toHaveProperty("text", "↓ ¥ -7,500");
      expect(result.contents[2]).toHaveProperty("wrap", true);
      expect(result.contents[2]).toHaveProperty("flex", 5);
      expect(result.contents[2]).toHaveProperty("weight", "bold");
      expect(result.contents[2]).toHaveProperty("size", "md");
      expect(result.contents[2]).toHaveProperty("align", "end");
      expect(result.contents[2]).toHaveProperty("color", "#1E90FF");
    });
  });

  describe("buildFixedCostContentRecord", () => {
    beforeEach(() => {
      mockDependencies.fixedCostSheet = jest.fn().mockImplementation(() => {
        return {
          sumColumn: jest.fn(() => 2000),
          scanRecord: jest.fn(() => [
            ["固定費1", 1000],
            ["固定費2", 200],
            ["固定費3", 0]
          ])
        };
      })() as FixedCostSheet;
    });

    it("should return correct fixed content when first record is true", () => {
      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.buildFixedCostContentRecord(true, "cost", 1000);

      expect(result).toHaveProperty("type", "box");
      expect(result).toHaveProperty("layout", "horizontal");
      expect(result).toHaveProperty("margin", "xs");
      expect(result).toHaveProperty("justifyContent", "flex-start");

      expect(result.contents[0]).toHaveProperty("type", "filler");

      expect(result.contents[1]).toHaveProperty("type", "text");
      expect(result.contents[1]).toHaveProperty("text", "固定費");
      expect(result.contents[1]).toHaveProperty("size", "sm");

      expect(result.contents[2]).toHaveProperty("type", "text");
      expect(result.contents[2]).toHaveProperty("text", "cost");
      expect(result.contents[2]).toHaveProperty("size", "sm");
      expect(result.contents[2]).toHaveProperty("flex", 3);

      expect(result.contents[3]).toHaveProperty("type", "text");
      expect(result.contents[3]).toHaveProperty("text", "¥ 1,000");
      expect(result.contents[3]).toHaveProperty("flex", 3);
      expect(result.contents[3]).toHaveProperty("align", "end");
    });

    it("should return correct fixed content when first record is false", () => {
      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.buildFixedCostContentRecord(false, "cost", 1000);

      expect(result).toHaveProperty("type", "box");
      expect(result).toHaveProperty("layout", "horizontal");
      expect(result).toHaveProperty("margin", "xs");
      expect(result).toHaveProperty("justifyContent", "flex-start");

      expect(result.contents[0]).toHaveProperty("type", "filler");
      expect(result.contents[0]).toHaveProperty("flex", 4);

      expect(result.contents[1]).toHaveProperty("type", "text");
      expect(result.contents[1]).toHaveProperty("text", "cost");
      expect(result.contents[1]).toHaveProperty("size", "sm");
      expect(result.contents[1]).toHaveProperty("flex", 3);

      expect(result.contents[2]).toHaveProperty("type", "text");
      expect(result.contents[2]).toHaveProperty("text", "¥ 1,000");
      expect(result.contents[2]).toHaveProperty("flex", 3);
      expect(result.contents[2]).toHaveProperty("align", "end");
    });
  });

  describe("buildFixedCostContent", () => {
    it("should return correct fixed content", () => {
      mockDependencies.fixedCostSheet = jest.fn().mockImplementation(() => {
        return {
          scanRecord: jest.fn(() => [
            ["固定費1", 1000],
            ["固定費2", 200],
            ["固定費3", 0]
          ])
        };
      })() as FixedCostSheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const mockBuildFixedCostContentRecord = jest
        .spyOn(summaryMessage, "buildFixedCostContentRecord")
        .mockReturnValue("mock" as unknown as FlexBox);

      const result = summaryMessage.buildFixedCostContent();

      expect(result).toHaveProperty("type", "box");
      expect(result).toHaveProperty("layout", "vertical");
      expect(result).toHaveProperty("margin", "sm");

      expect(mockBuildFixedCostContentRecord).toHaveBeenCalledTimes(3);

      expect(mockBuildFixedCostContentRecord).toHaveBeenNthCalledWith(1, true, "固定費1", 1000);
      expect(mockBuildFixedCostContentRecord).toHaveBeenNthCalledWith(2, false, "固定費2", 200);
      expect(mockBuildFixedCostContentRecord).toHaveBeenNthCalledWith(3, false, "固定費3", 0);

      expect(result.contents[0]).toEqual("mock");
    });

    it("should throw error when cost name is not string", () => {
      mockDependencies.fixedCostSheet = jest.fn().mockImplementation(() => {
        return {
          scanRecord: jest.fn(() => [[1000, 1000]])
        };
      })() as FixedCostSheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      expect(() => summaryMessage.buildFixedCostContent()).toThrow(Error("Cost name is not string!"));
    });

    it("should throw error when cost value is not number", () => {
      mockDependencies.fixedCostSheet = jest.fn().mockImplementation(() => {
        return {
          scanRecord: jest.fn(() => [["固定費1", "固定費1"]])
        };
      })() as FixedCostSheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      expect(() => summaryMessage.buildFixedCostContent()).toThrow(Error("Cost value is not number!"));
    });
  });

  describe("buildPieChartImageContent", () => {
    it("should return correct pie chart image content", () => {
      mockDependencies.pieChartSheet = jest.fn().mockImplementation(() => {
        return {
          uploadChart: jest.fn(),
          downloadChartUrl: jest.fn(() => "https://dummy.com")
        };
      })() as PieChartSheet;

      // 変更した mockDependencies を使って再度インスタンスを生成
      summaryMessage = SummaryMessageFactory.create(mockDependencies);

      const result = summaryMessage.buildPieChartImageContent();

      expect(result).toHaveProperty("type", "image");
      expect(result).toHaveProperty("url", "https://dummy.com");
      expect(result).toHaveProperty("size", "full");
      expect(result).toHaveProperty("align", "center");
    });
  });
});
