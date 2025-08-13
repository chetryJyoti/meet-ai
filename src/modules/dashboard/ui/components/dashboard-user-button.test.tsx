/**
 * Tests for DashboardUserButton
 * Framework/Libraries: React Testing Library with Jest/Vitest APIs.
 * - Uses @testing-library/react for rendering and events.
 * - Mocks next/navigation useRouter and the authClient.
 *
 * Scenarios covered:
 * - Returns null while session is pending
 * - Returns null when no user in session
 * - Renders avatar image when user.image exists
 * - Renders generated avatar when user.image is missing
 * - Displays user name and email in trigger
 * - Opens dropdown content on trigger interaction and shows Billing and Logout items
 * - Clicking Logout calls authClient.signOut with onSuccess that triggers router.push('/sign-in')
 */

import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Mock next/navigation useRouter
vi.mock("next/navigation", () => {
  const push = vi.fn();
  const replace = vi.fn();
  const back = vi.fn();
  const prefetch = vi.fn();
  const refresh = vi.fn();
  const mockRouter = { push, replace, back, prefetch, refresh };
  return {
    useRouter: () => mockRouter,
  };
});

// Mock authClient with useSession and signOut
vi.mock("@/lib/auth-client", () => {
  return {
    authClient: {
      useSession: vi.fn(),
      signOut: vi.fn(),
    },
  };
});

// Mock sub-components that may rely on Radix/portals to keep DOM local and predictable
vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = (await import("react")).default;
  // Provide simplified stand-ins that render content inline for easy querying
  const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => <div data-testid="dropdown-menu">{children}</div>;
  const DropdownMenuTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, ...rest }) => (
    <button type="button" aria-haspopup="menu" aria-expanded="false" {...rest}>
      {children}
    </button>
  );
  const DropdownMenuContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div role="menu" data-testid="dropdown-content">{children}</div>
  );
  const DropdownMenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <div role="note">{children}</div>;
  const DropdownMenuSeparator: React.FC = () => <hr aria-hidden="true" />;
  const DropdownMenuItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, onClick, ...rest }) => (
    <button role="menuitem" onClick={onClick} {...rest}>
      {children}
    </button>
  );
  return {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  };
});

// Mock avatar components to avoid image loading concerns
vi.mock("@/components/ui/avatar", () => {
  return {
    Avatar: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar">{children}</div>,
    AvatarImage: ({ src }: { src?: string }) => <img data-testid="avatar-image" src={src} alt="" />,
  };
});

// Mock GeneratedAvatar to assert props passed
vi.mock("@/components/generated-avatar", () => {
  return {
    GeneratedAvatar: ({ seed, variant, className }: { seed: string; variant: string; className?: string }) => (
      <div data-testid="generated-avatar" data-seed={seed} data-variant={variant} data-class={className} />
    ),
  };
});

// Import after mocks
import { DashboardUserButton } from "./dashboard-user-button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type UseSessionReturn = { data?: { user?: { name?: string; email?: string; image?: string | null } } | null; isPending: boolean };

const mockUseSession = authClient.useSession as unknown as vi.Mock;
const mockSignOut = authClient.signOut as unknown as vi.Mock;

function setUseSession(value: UseSessionReturn) {
  mockUseSession.mockImplementation(() => value);
}

describe("DashboardUserButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null while session is pending", () => {
    setUseSession({ data: null, isPending: true });
    const { container } = render(<DashboardUserButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("returns null when no user is present", () => {
    setUseSession({ data: { user: undefined }, isPending: false });
    const { container } = render(<DashboardUserButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders avatar image when user.image exists", () => {
    setUseSession({
      data: { user: { name: "Jane Roe", email: "jane@example.com", image: "https://img.example/jane.png" } },
      isPending: false,
    });
    render(<DashboardUserButton />);

    // Trigger area should show image avatar, not generated avatar
    expect(screen.queryByTestId("generated-avatar")).not.toBeInTheDocument();
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toBeInTheDocument();
    const img = screen.getByTestId("avatar-image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("https://img.example/jane.png");

    // Shows user name and email in the trigger area
    expect(screen.getAllByText("Jane Roe")[0]).toBeInTheDocument();
    expect(screen.getAllByText("jane@example.com")[0]).toBeInTheDocument();

    // Dropdown content exists and reflects user info as well
    expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
    expect(screen.getAllByText("Jane Roe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("jane@example.com").length).toBeGreaterThanOrEqual(1);
  });

  it("renders GeneratedAvatar when user.image is missing", () => {
    setUseSession({
      data: { user: { name: "John Doe", email: "john@example.com", image: null } },
      isPending: false,
    });
    render(<DashboardUserButton />);

    const gen = screen.getByTestId("generated-avatar");
    expect(gen).toBeInTheDocument();
    expect(gen).toHaveAttribute("data-seed", "John Doe");
    expect(gen).toHaveAttribute("data-variant", "initials");
    expect(gen).toHaveAttribute("data-class"); // has className value
    expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
  });

  it("displays Billing and Logout menu items", async () => {
    setUseSession({
      data: { user: { name: "User Name", email: "user@example.com", image: null } },
      isPending: false,
    });
    render(<DashboardUserButton />);

    // Open the menu by clicking trigger (our mocked trigger is a button)
    const trigger = screen.getByRole("button", { expanded: false });
    await userEvent.click(trigger);

    const menu = screen.getByTestId("dropdown-content");
    expect(menu).toBeInTheDocument();

    const utils = within(menu);
    expect(utils.getByRole("menuitem", { name: /Billing/i })).toBeInTheDocument();
    expect(utils.getByRole("menuitem", { name: /Logout/i })).toBeInTheDocument();
  });

  it("calls authClient.signOut and navigates to /sign-in on Logout click", async () => {
    setUseSession({
      data: { user: { name: "User Name", email: "user@example.com", image: null } },
      isPending: false,
    });

    // Setup signOut mock to trigger onSuccess callback
    mockSignOut.mockImplementation((args: any) => {
      const cb = args?.fetchOptions?.onSuccess;
      if (typeof cb === "function") cb();
      return Promise.resolve();
    });

    const router = useRouter() as unknown as { push: (path: string) => void };
    const pushSpy = vi.spyOn(router, "push");

    render(<DashboardUserButton />);

    // Click trigger then Logout
    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menu = screen.getByTestId("dropdown-content");
    const utils = within(menu);
    const logoutItem = utils.getByRole("menuitem", { name: /Logout/i });

    await userEvent.click(logoutItem);

    // signOut called with object containing fetchOptions.onSuccess
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    const callArg = mockSignOut.mock.calls[0][0];
    expect(callArg).toBeDefined();
    expect(callArg.fetchOptions).toBeDefined();
    expect(typeof callArg.fetchOptions.onSuccess).toBe("function");

    // Router navigation invoked to '/sign-in'
    expect(pushSpy).toHaveBeenCalledWith("/sign-in");
  });

  it("is resilient if signOut is called without onSuccess (does not throw)", async () => {
    setUseSession({
      data: { user: { name: "User Name", email: "user@example.com", image: null } },
      isPending: false,
    });

    mockSignOut.mockResolvedValue(undefined);

    const router = useRouter() as unknown as { push: (path: string) => void };
    const pushSpy = vi.spyOn(router, "push");

    render(<DashboardUserButton />);
    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);

    const menu = screen.getByTestId("dropdown-content");
    const utils = within(menu);
    const logoutItem = utils.getByRole("menuitem", { name: /Logout/i });

    await userEvent.click(logoutItem);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(pushSpy).not.toHaveBeenCalled();
  });
});