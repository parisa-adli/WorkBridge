import "@testing-library/jest-dom/vitest";
// components call useTranslation; without init they would render keys
import i18n from "../i18n";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  return i18n.changeLanguage("fa");
});
