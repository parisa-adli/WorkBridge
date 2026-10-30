import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Select from "./Select";
import Filter from "./Filter";
import FilterDropDown from "./FilterDropDown";

const pick = (combobox: string, option: string) => {
  fireEvent.keyDown(screen.getByRole("combobox", { name: combobox }), { key: "Enter" });
  fireEvent.keyDown(screen.getByRole("option", { name: option }), { key: "Enter" });
};

function Search() {
  return <output>{useLocation().search}</output>;
}

describe("Select", () => {
  it("shows and returns the empty option as an empty string", () => {
    const onValueChange = vi.fn();
    const options = [
      { value: "", label: "بدون والد" },
      { value: "c1", label: "طراحی" },
    ];
    const { rerender } = render(<Select label="والد" options={options} value="" onValueChange={onValueChange} />);
    expect(screen.getByRole("combobox", { name: "والد" })).toHaveTextContent("بدون والد");

    pick("والد", "طراحی");
    expect(onValueChange).toHaveBeenLastCalledWith("c1");
    rerender(<Select label="والد" options={options} value="c1" onValueChange={onValueChange} />);
    pick("والد", "بدون والد");
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });
});

describe("URL filters", () => {
  const options = [
    { value: "ALL", label: "همه" },
    { value: "OPEN", label: "باز" },
  ];

  it("FilterDropDown shows the first option without a param and writes the picked one", () => {
    render(
      <MemoryRouter initialEntries={["/?page=3"]}>
        <FilterDropDown filterField="category" label="دسته" options={options} />
        <Search />
      </MemoryRouter>
    );
    expect(screen.getByRole("combobox", { name: "دسته" })).toHaveTextContent("همه");
    pick("دسته", "باز");
    expect(screen.getByRole("status")).toHaveTextContent("?category=OPEN");
  });

  it("Filter writes the pressed item and keeps it on a second click", () => {
    render(
      <MemoryRouter initialEntries={["/?page=3"]}>
        <Filter filterField="status" options={options} />
        <Search />
      </MemoryRouter>
    );
    expect(screen.getByRole("radio", { name: "همه" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "باز" }));
    expect(screen.getByRole("status")).toHaveTextContent("?status=OPEN");
    fireEvent.click(screen.getByRole("radio", { name: "باز" }));
    expect(screen.getByRole("radio", { name: "باز" })).toBeChecked();
  });
});
