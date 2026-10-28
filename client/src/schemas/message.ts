import i18n from "../i18n";

// Zod runs the error callback when a parse fails, so messages follow the active language.
export const msg = (key: string, options?: Record<string, unknown>) => ({ error: () => i18n.t(key, options) });
export type Msg = ReturnType<typeof msg>;
