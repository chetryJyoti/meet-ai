/**
 * Tests for GeneratedAvatar component.
 *
 * Assumed Framework: Vitest + React Testing Library.
 * - If using Jest instead: replace vi with jest and adapt mocks.
 * - We use virtual mocks to avoid depending on actual external packages and path aliases.
 * - Focus areas based on the component:
 *   - Variant switching between botttsNeutral and initials
 *   - Fallback initial derived from seed
 *   - Passing seed/options to createAvatar
 *   - Applying className via cn
 *   - Image props (src derived from toDataUri, alt="Avatar")
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Virtual mock for @dicebear/core (module may not be installed in this repo)
vi.mock("@dicebear/core", () => {
  return {
    createAvatar: vi.fn(() => {
      return {
        toDataUri: vi.fn(() => "data:image/svg+xml;base64,FAKE_SVG_DATA"),
      };
    }),
  };
}, { virtual: true });

// Virtual mock for @dicebear/collection
vi.mock("@dicebear/collection", () => {
  return {
    botttsNeutral: { __kind: "botttsNeutral" },
    initials: { __kind: "initials" },
  };
}, { virtual: true });

// Virtual mock for the Avatar UI primitives used by the component
vi.mock("./ui/avatar", () => {
  const Avatar = ({ className, children }: any) => (
    <div data-testid="avatar-root" className={className ?? ""}>
      {children}
    </div>
  );
  const AvatarImage = ({ src, alt }: any) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  );
  const AvatarFallback = ({ children }: any) => (
    <div data-testid="avatar-fallback">{children}</div>
  );
  return { Avatar, AvatarImage, AvatarFallback };
}, { virtual: true });

// Virtual mock for "@/lib/utils" cn helper, to avoid alias resolution issues
vi.mock("@/lib/utils", () => {
  return {
    cn: (...classes: string[]) => classes.filter(Boolean).join(" ").trim(),
  };
}, { virtual: true });

// Import after mocks so they apply to the module under test
import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials } from "@dicebear/collection";
import { GeneratedAvatar } from "./generated-avatar";

describe("GeneratedAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders image and fallback for variant 'bottsNeutral' with provided seed", () => {
    render(<GeneratedAvatar seed="alice" variant="bottsNeutral" className="w-8 h-8" />);

    const root = screen.getByTestId("avatar-root");
    expect(root).toBeTruthy();
    expect(root.getAttribute("class")).toContain("w-8 h-8");

    const img = screen.getByTestId("avatar-image") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute("alt")).toBe("Avatar");
    expect(img.src).toContain("data:image/svg+xml;base64,FAKE_SVG_DATA");

    const fallback = screen.getByTestId("avatar-fallback");
    expect(fallback.textContent).toBe("A");

    expect(createAvatar).toHaveBeenCalledTimes(1);
    expect(createAvatar).toHaveBeenCalledWith(botttsNeutral, { seed: "alice" });
  });

  it("renders image and fallback for variant 'initials' and passes font options", () => {
    render(<GeneratedAvatar seed="bob" variant="initials" className="rounded-full" />);

    const root = screen.getByTestId("avatar-root");
    expect(root.getAttribute("class")).toContain("rounded-full");

    const img = screen.getByTestId("avatar-image") as HTMLImageElement;
    expect(img.src).toContain("data:image/svg+xml;base64,FAKE_SVG_DATA");
    expect(img.getAttribute("alt")).toBe("Avatar");

    const fallback = screen.getByTestId("avatar-fallback");
    expect(fallback.textContent).toBe("B");

    expect(createAvatar).toHaveBeenCalledTimes(1);
    expect(createAvatar).toHaveBeenCalledWith(initials, {
      seed: "bob",
      fontWeight: 500,
      fontSize: 42,
    });
  });

  it("applies only provided className via cn and no extraneous classes", () => {
    render(<GeneratedAvatar seed="charlie" variant="bottsNeutral" className="shadow border p-2" />);

    const root = screen.getByTestId("avatar-root");
    expect(root.getAttribute("class")).toBe("shadow border p-2");
  });

  it("handles missing className by rendering with empty class attribute", () => {
    render(<GeneratedAvatar seed="delta" variant="bottsNeutral" />);
    const root = screen.getByTestId("avatar-root");
    expect(root.getAttribute("class")).toBe("");
  });

  it("uses empty fallback text when seed is an empty string", () => {
    render(<GeneratedAvatar seed="" variant="initials" />);

    const fallback = screen.getByTestId("avatar-fallback");
    expect(fallback.textContent).toBe("");

    expect(createAvatar).toHaveBeenCalledWith(initials, {
      seed: "",
      fontWeight: 500,
      fontSize: 42,
    });
  });

  it("calls toDataUri once per render and returns its result for image src", () => {
    const toDataUriSpy = vi.fn(() => "data:image/svg+xml;base64,SAME");
    (createAvatar as any).mockReturnValueOnce({ toDataUri: toDataUriSpy });

    render(<GeneratedAvatar seed="echo" variant="bottsNeutral" />);

    const img = screen.getByTestId("avatar-image") as HTMLImageElement;
    expect(img.src).toContain("data:image/svg+xml;base64,SAME");
    expect(toDataUriSpy).toHaveBeenCalledTimes(1);

    expect(createAvatar).toHaveBeenCalledWith(botttsNeutral, { seed: "echo" });
  });

  it("switches generator based on variant prop", () => {
    render(<GeneratedAvatar seed="foxtrot" variant="bottsNeutral" />);
    expect(createAvatar).toHaveBeenCalledWith(botttsNeutral, { seed: "foxtrot" });

    vi.clearAllMocks();

    render(<GeneratedAvatar seed="foxtrot" variant="initials" />);
    expect(createAvatar).toHaveBeenCalledWith(initials, {
      seed: "foxtrot",
      fontWeight: 500,
      fontSize: 42,
    });
  });

  it("sets alt text as 'Avatar' on the image element", () => {
    render(<GeneratedAvatar seed="golf" variant="bottsNeutral" />);
    const img = screen.getByRole("img", { name: "Avatar" });
    expect(img).toBeTruthy();
  });

  it("handles seeds with leading spaces and non-letters for fallback character", () => {
    render(<GeneratedAvatar seed="  7golf" variant="initials" />);
    const fallback = screen.getByTestId("avatar-fallback");
    // '  7golf'.charAt(0).toUpperCase() -> ' '
    expect(fallback.textContent).toBe(" ");
  });
});