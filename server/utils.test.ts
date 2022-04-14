import { stringToInt } from "./utils";

describe("stringToInt", () => {
  it("should convert numeric(int) string to int", () => {
    expect(stringToInt().parse("1234")).toBe(1234);
  });

  it("should throw error when input is not integer", () => {
    expect(() => stringToInt().parse("1.23")).toThrowError();
  });
});
