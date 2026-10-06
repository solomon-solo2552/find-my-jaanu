import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";


describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("calls onClick when clicked", () => {
        const onClick =vi.fn();
        render(<Button onClick={onClick}>Click</Button>);
        fireEvent.click(screen.getByText("Click"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when loading", () => {
        render(<Button loading>Loading</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does not fire onClick when disabled", () => {
        const onClick = vi.fn();
        render(<Button disabled onClick={onClick}>Click</Button>);
        fireEvent.click(screen.getByText("Click"));
        expect(onClick).not.toHaveBeenCalled();
    });
});