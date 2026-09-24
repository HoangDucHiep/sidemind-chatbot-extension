import { describe, it, expect } from "vitest";
import { DICTIONARY, t, setLang } from "../lib/i18n";

describe("i18n Localization Integrity", () => {
  it("should have matching keys between EN and VI dictionaries", () => {
    const enKeys = Object.keys(DICTIONARY.en).sort();
    const viKeys = Object.keys(DICTIONARY.vi).sort();

    const missingInVi = enKeys.filter((k) => !(k in DICTIONARY.vi));
    const missingInEn = viKeys.filter((k) => !(k in DICTIONARY.en));

    expect(missingInVi).toEqual([]);
    expect(missingInEn).toEqual([]);
    expect(enKeys.length).toBeGreaterThan(30);
  });

  it("should translate correctly using t() function", () => {
    setLang("en");
    expect(t("global.theme.light")).toBe("Light");

    setLang("vi");
    expect(t("global.theme.light")).toBe("Sáng");
  });

  it("should fallback gracefully to English or default text for missing keys", () => {
    setLang("vi");
    expect(t("non.existent.key", "Fallback Text")).toBe("Fallback Text");
  });
});
