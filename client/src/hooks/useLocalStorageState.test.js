import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useLocalStorageState from "./useLocalStorageState";

describe("useLocalStorageState", () => {
  it("uses the initial state when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorageState("isDarkMode", false));
    expect(result.current[0]).toBe(false);
    expect(localStorage.getItem("isDarkMode")).toBe("false");
  });

  it("persists a new value and restores it on the next mount", () => {
    const first = renderHook(() => useLocalStorageState("isDarkMode", false));
    act(() => first.result.current[1](true));
    expect(localStorage.getItem("isDarkMode")).toBe("true");
    first.unmount();

    const second = renderHook(() => useLocalStorageState("isDarkMode", false));
    expect(second.result.current[0]).toBe(true);
  });

  it("writes to localStorage only when the value changes, not on every render", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { result, rerender } = renderHook(() => useLocalStorageState("isDarkMode", false));
    rerender();
    rerender();
    expect(setItem).toHaveBeenCalledTimes(1);
    act(() => result.current[1](true));
    expect(setItem).toHaveBeenCalledTimes(2);
    setItem.mockRestore();
  });
});
