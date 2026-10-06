import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InterestPicker } from "./InterestPicker";

const interests = [
  { id: 1, name: "Hiking", emoji: "🥾" },
  { id: 2, name: "Coding", emoji: "💻" },
  { id: 3, name: "Chai", emoji: "☕" },
];

describe("InterestPicker", () => {
  it("renders all interests", () => {
    render(
      <InterestPicker interests={interests} selectedIds={[]} onChange={() => {}} />
    );
    expect(screen.getByText(/Hiking/)).toBeInTheDocument();
    expect(screen.getByText(/Coding/)).toBeInTheDocument();
    expect(screen.getByText(/Chai/)).toBeInTheDocument();
  });

  it("adds an interest on click", () => {
    const onChange = vi.fn();
    render(
      <InterestPicker interests={interests} selectedIds={[]} onChange={onChange} />
    );
    fireEvent.click(screen.getByText(/Hiking/));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("removes an interest on click when already selected", () => {
    const onChange = vi.fn();
    render(
      <InterestPicker interests={interests} selectedIds={[1, 2]} onChange={onChange} />
    );
    fireEvent.click(screen.getByText(/Hiking/));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("enforces max selection", () => {
    const onChange = vi.fn();
    render(
      <InterestPicker
        interests={interests}
        selectedIds={[1, 2]}
        onChange={onChange}
        max={2}
      />
    );
    fireEvent.click(screen.getByText(/Chai/));
    expect(onChange).not.toHaveBeenCalled();
  });
});