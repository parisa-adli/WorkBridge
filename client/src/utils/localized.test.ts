import { afterEach, describe, expect, it } from "vitest";
import i18n from "../i18n";
import localized, { categoryName } from "./localized";

const project = {
  title: "طراحی لوگو",
  tags: ["لوگو"],
  translations: { en: { title: "Logo design", tags: ["Logo"] } },
};
const userEntered = { title: "پروژه من", tags: ["تگ"] };

afterEach(() => i18n.changeLanguage("fa"));

describe("localized", () => {
  it("shows the Persian base fields in fa", () => {
    expect(localized(project, "title")).toBe("طراحی لوگو");
    expect(localized(project, "tags")).toEqual(["لوگو"]);
  });

  it("shows translations.en in en", async () => {
    await i18n.changeLanguage("en");
    expect(localized(project, "title")).toBe("Logo design");
    expect(localized(project, "tags")).toEqual(["Logo"]);
  });

  it("falls back to the base field in en when there is no translation", async () => {
    await i18n.changeLanguage("en");
    expect(localized(userEntered as typeof project, "title")).toBe("پروژه من");
    expect(localized({ ...project, translations: { en: {} } } as typeof project, "title")).toBe("طراحی لوگو");
  });
});

describe("categoryName", () => {
  const category = { title: "طراحی", englishTitle: "design" };

  it("uses title in fa and englishTitle in en", async () => {
    expect(categoryName(category)).toBe("طراحی");
    await i18n.changeLanguage("en");
    expect(categoryName(category)).toBe("design");
  });
});
