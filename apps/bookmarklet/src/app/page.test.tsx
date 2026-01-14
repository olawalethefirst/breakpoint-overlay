import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Home from "./page";

describe("Bookmarklet generator", () => {
  it("updates the bookmarklet when the script URL changes", async () => {
    render(<Home />);
    const user = userEvent.setup();

    const scriptInput = screen.getByPlaceholderText(
      "CDN base URL (e.g. https://unpkg.com)"
    );

    await user.clear(scriptInput);
    await user.type(scriptInput, "https://cdn.example.com");

    const output = screen
      .getAllByRole("textbox")
      .find(
        (node) =>
          node instanceof HTMLTextAreaElement &&
          node.readOnly &&
          node.value.startsWith("javascript:")
      ) as HTMLTextAreaElement;

    expect(output.value).toContain(
      "https://cdn.example.com/breakpoint-overlay/dist/index.iife.js"
    );
  });

  it("updates the bookmarklet when the hotkey changes", async () => {
    render(<Home />);
    const user = userEvent.setup();

    const hotkeyInput = screen.getByPlaceholderText(
      "alt+shift+o"
    ) as HTMLInputElement;
    await user.clear(hotkeyInput);
    await user.type(hotkeyInput, "ctrl+g");

    const output = screen
      .getAllByRole("textbox")
      .find(
        (node) =>
          node instanceof HTMLTextAreaElement &&
          node.readOnly &&
          node.value.startsWith("javascript:")
      ) as HTMLTextAreaElement;

    await waitFor(() => {
      expect(output.value).toContain('"hotkey":"ctrl+g"');
    });
  });

  it("copies the bookmarklet to the clipboard", async () => {
    if (!navigator.clipboard) {
      Object.defineProperty(window.navigator, "clipboard", {
        value: { writeText: async () => undefined },
        configurable: true,
      });
    }
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(<Home />);
    const user = userEvent.setup();

    const outputCard = screen.getByText("Bookmarklet Output").closest("div");
    if (!outputCard) throw new Error("Bookmarklet output card not found.");
    const copyButton = within(outputCard).getByRole("button", { name: "Copy" });
    await user.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});
