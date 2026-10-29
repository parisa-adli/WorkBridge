import "@testing-library/jest-dom/vitest";
// components call useTranslation; without init they would render keys
import i18n from "../i18n";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no layout APIs: Radix Select scrolls the selected option into view, RadioGroup measures its items.
Element.prototype.scrollIntoView ??= () => {};
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  return i18n.changeLanguage("fa");
});
