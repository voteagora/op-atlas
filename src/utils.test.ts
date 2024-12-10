import { decodeData } from "./utils";
import { encodeAbiParameters, parseAbiParameters } from "viem";

describe("decodeData", () => {
  it("should decode string, address, and string parameters", () => {
    // Arrange
    const testData = [
      {
        rpgfRound: "Round 1",
        referredBy: "0x1234567890123456789012345678901234567890",
        referredMethod: "direct",
      },
    ];
    const signature =
      "(string rpgfRound,address referredBy,string referredMethod)";
    const encodedData = encodeAbiParameters(
      parseAbiParameters(signature),
      // @ts-expect-error
      testData
    );

    // Act
    const result = decodeData(encodedData, signature);

    // Assert
    expect(result).toEqual(testData);
  });

  it("should decode uint256 and string parameters", () => {
    // Arrange
    const testData = [{ farcasterId: 12345n, selectionMethod: "manual" }];
    const signature = "(uint256 farcasterId,string selectionMethod)";
    const encodedData = encodeAbiParameters(
      parseAbiParameters(signature),
      // @ts-expect-error
      testData
    );

    // Act
    const result = decodeData(encodedData, signature);

    // Assert
    expect(result).toEqual(testData);
  });

  it("should handle empty string parameters", () => {
    // Arrange
    const testData = [
      {
        rpgfRound: "",
        referredBy: "0x1234567890123456789012345678901234567890",
        referredMethod: "",
      },
    ];
    const signature =
      "(string rpgfRound,address referredBy,string referredMethod)";
    const encodedData = encodeAbiParameters(
      parseAbiParameters(signature),
      // @ts-expect-error
      testData
    );

    // Act
    const result = decodeData(encodedData, signature);

    // Assert
    expect(result).toEqual(testData);
  });

  it("should handle signatures with 0x prefix", () => {
    // Arrange
    const testData = [{ value: 123n }];
    const signature = "0x(uint256 value)";
    const encodedData = encodeAbiParameters(
      parseAbiParameters("(uint256 value)"),
      // @ts-expect-error
      testData
    );

    // Act
    const result = decodeData(encodedData, signature);

    // Assert
    expect(result).toEqual(testData);
  });

  it("should throw error for invalid encoded data", () => {
    // Arrange
    const invalidEncodedData = "0x1234";
    const signature = "(uint256 value)";

    // Act & Assert
    expect(() => decodeData(invalidEncodedData, signature)).toThrow();
  });

  it("should throw error for invalid signature", () => {
    // Arrange
    const testData = [{ value: 123n }];
    const signature = "invalid signature";
    const encodedData = encodeAbiParameters(
      parseAbiParameters("(uint256 value)"),
      // @ts-expect-error
      testData
    );

    // Act & Assert
    expect(() => decodeData(encodedData, signature)).toThrow();
  });
});
