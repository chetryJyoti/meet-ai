/**
 * Tests for SignUpView
 *
 * Framework: Jest
 * Library: @testing-library/react and @testing-library/jest-dom
 *
 * These tests focus on the SignUpView UI and behavior:
 * - Validation errors via zod/react-hook-form
 * - Successful sign-up flow triggers router.push("/") via authClient.signUp.email onSuccess
 * - Error handling via onError callback and rejected promise catch
 * - Social sign-in flows for Google and GitHub
 * - Password visibility toggles for both password fields
 * - Disabled states during loading
 *
 * If your project uses Vitest, replace jest.* with vi.* and ensure test setup imports jest-dom.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

// Import the component via relative path since the test resides alongside the component
// If the component file is named differently (e.g., SignUpView.tsx), adjust the import accordingly.
import { SignUpView } from "./sign-up-view";

// Mock next/router navigation
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock next/image to avoid Next.js Image complexities in Jest environment
jest.mock("next/image", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockedNextImage(props: any) {
    // Render as a standard img element preserving alt/src attributes
    // Ignore Next.js optimization props for testing simplicity
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  };
});

// Mock the authentication client
const signUpEmailMock = jest.fn();
const signInSocialMock = jest.fn();

jest.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: (...args: unknown[]) => signUpEmailMock(...args),
    },
    signIn: {
      social: (...args: unknown[]) => signInSocialMock(...args),
    },
  },
}));

// For cleaner queries
const q = {
  name: () => screen.getByLabelText(/full name/i),
  email: () => screen.getByLabelText(/email/i),
  password: () => screen.getByPlaceholderText(/create a password/i),
  confirmPassword: () => screen.getByPlaceholderText(/confirm your password/i),
  submit: () => screen.getByRole("button", { name: /create account/i }),
  submitLoading: () => screen.getByRole("button", { name: /creating account/i }),
  google: () => screen.getByRole("button", { name: /continue with google/i }),
  github: () => screen.getByRole("button", { name: /continue with github/i }),
  signInLink: () => screen.getByRole("button", { name: /sign in/i }),
  destructiveAlert: () => screen.getByRole("alert"),
};

function renderView() {
  pushMock.mockReset();
  signUpEmailMock.mockReset();
  signInSocialMock.mockReset();
  return render(<SignUpView />);
}

describe("SignUpView", () => {
  test("renders essential fields and actions", () => {
    renderView();

    expect(screen.getByRole("heading", { name: /create your account/i })).toBeInTheDocument();

    expect(q.name()).toBeInTheDocument();
    expect(q.email()).toBeInTheDocument();
    expect(q.password()).toBeInTheDocument();
    expect(q.confirmPassword()).toBeInTheDocument();

    expect(q.google()).toBeInTheDocument();
    expect(q.github()).toBeInTheDocument();
    expect(q.submit()).toBeInTheDocument();
    expect(q.signInLink()).toBeInTheDocument();
  });

  test("shows validation errors for empty submission", async () => {
    renderView();

    await userEvent.click(q.submit());

    // Expect validation errors rendered by FormMessage
    expect(await screen.findAllByText(/must be at least/i)).toHaveLength(2); // name and password length
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();

    // Ensure sign-up not attempted
    expect(signUpEmailMock).not.toHaveBeenCalled();
  });

  test("shows validation error when passwords do not match", async () => {
    renderView();

    await userEvent.type(q.name(), "Jane Doe");
    await userEvent.type(q.email(), "jane@example.com");
    await userEvent.type(q.password(), "strongpass");
    await userEvent.type(q.confirmPassword(), "different");

    await userEvent.click(q.submit());

    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument();
    expect(signUpEmailMock).not.toHaveBeenCalled();
  });

  test("successful sign-up triggers router.push('/') via onSuccess callback", async () => {
    renderView();

    // Mock to call onSuccess synchronously and return resolved Promise
    signUpEmailMock.mockImplementation(
      async (_payload: unknown, opts: { onSuccess?: () => void; onError?: (a: { error: Error }) => void }) => {
        opts?.onSuccess?.();
        return Promise.resolve();
      }
    );

    await userEvent.type(q.name(), "John Smith");
    await userEvent.type(q.email(), "john@example.com");
    await userEvent.type(q.password(), "verysecure");
    await userEvent.type(q.confirmPassword(), "verysecure");

    await userEvent.click(q.submit());

    // While submitting, button shows loading state; then goes back
    expect(await screen.findByRole("button", { name: /creating account/i })).toBeInTheDocument();
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
    // After success, button may return to default state (component redirects)
    expect(signUpEmailMock).toHaveBeenCalledTimes(1);

    // Validate payload arguments
    const [payloadArg] = signUpEmailMock.mock.calls[0] as [any, any];
    expect(payloadArg).toMatchObject({
      name: "John Smith",
      email: "john@example.com",
      password: "verysecure",
    });
  });

  test("onError callback sets error message and re-enables submit", async () => {
    renderView();

    signUpEmailMock.mockImplementation(
      async (_payload: unknown, opts: { onSuccess?: () => void; onError?: (a: { error: Error }) => void }) => {
        opts?.onError?.({ error: new Error("Sign up failed for testing") });
        return Promise.resolve();
      }
    );

    await userEvent.type(q.name(), "John Smith");
    await userEvent.type(q.email(), "john@example.com");
    await userEvent.type(q.password(), "verysecure");
    await userEvent.type(q.confirmPassword(), "verysecure");

    await userEvent.click(q.submit());

    const alert = await q.destructiveAlert();
    expect(within(alert).getByText(/sign up failed for testing/i)).toBeInTheDocument();

    // Button returns to default after error
    expect(q.submit()).toBeEnabled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test("rejected promise in signUp path sets error via catch block", async () => {
    renderView();

    signUpEmailMock.mockRejectedValue(new Error("Network blew up"));

    await userEvent.type(q.name(), "John Smith");
    await userEvent.type(q.email(), "john@example.com");
    await userEvent.type(q.password(), "verysecure");
    await userEvent.type(q.confirmPassword(), "verysecure");

    await userEvent.click(q.submit());

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/network blew up/i)).toBeInTheDocument();
    expect(q.submit()).toBeEnabled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test("social sign-in: Google success path triggers client call and disables during pending", async () => {
    renderView();

    // Create a deferred promise to assert disabled state while pending
    let resolveFn: (v?: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveFn = resolve;
    });
    signInSocialMock.mockReturnValue(pending);

    const googleButton = q.google();
    expect(googleButton).toBeEnabled();

    await userEvent.click(googleButton);

    // During pending, all auth buttons should be disabled
    expect(googleButton).toBeDisabled();
    expect(q.github()).toBeDisabled();
    expect(q.submit()).toBeDisabled();
    expect(q.signInLink()).toBeDisabled();

    // Validate call payload
    expect(signInSocialMock).toHaveBeenCalledWith({ provider: "google" });

    // Resolve pending
    resolveFn();
    await waitFor(() => expect(q.submit()).toBeEnabled());
  });

  test("social sign-in: GitHub failure sets error message", async () => {
    renderView();

    signInSocialMock.mockRejectedValue(new Error("GitHub sign in failed."));

    await userEvent.click(q.github());

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/github sign in failed\./i)).toBeInTheDocument();

    // Controls should be re-enabled after failure (finally sets isLoading to false)
    await waitFor(() => expect(q.submit()).toBeEnabled());
  });

  test("password visibility toggle switches type for password field", async () => {
    renderView();

    const passwordInput = q.password();

    // Find the toggle button within the password field container
    const wrapper = passwordInput.closest("div");
    expect(wrapper).toBeTruthy();
    const toggle = within(wrapper as HTMLElement).getByRole("button");

    expect(passwordInput).toHaveAttribute("type", "password");

    await userEvent.click(toggle);
    expect(passwordInput).toHaveAttribute("type", "text");

    await userEvent.click(toggle);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("confirm password visibility toggle switches type for confirm field", async () => {
    renderView();

    const confirmInput = q.confirmPassword();

    const wrapper = confirmInput.closest("div");
    expect(wrapper).toBeTruthy();
    const toggle = within(wrapper as HTMLElement).getByRole("button");

    expect(confirmInput).toHaveAttribute("type", "password");

    await userEvent.click(toggle);
    expect(confirmInput).toHaveAttribute("type", "text");

    await userEvent.click(toggle);
    expect(confirmInput).toHaveAttribute("type", "password");
  });

  test("navigates to sign in when clicking Sign In link", async () => {
    renderView();

    await userEvent.click(q.signInLink());

    expect(pushMock).toHaveBeenCalledWith("/sign-in");
  });

  test("terms and privacy buttons are present and disabled while loading", async () => {
    renderView();

    // Before loading
    const termsBtn = screen.getByRole("button", { name: /terms of service/i });
    const privacyBtn = screen.getByRole("button", { name: /privacy policy/i });
    expect(termsBtn).toBeEnabled();
    expect(privacyBtn).toBeEnabled();

    // Trigger loading by starting a social sign-in with a deferred promise
    let resolveFn: (v?: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveFn = resolve;
    });
    signInSocialMock.mockReturnValue(pending);

    await userEvent.click(q.google());

    expect(termsBtn).toBeDisabled();
    expect(privacyBtn).toBeDisabled();

    resolveFn();
    await waitFor(() => {
      expect(termsBtn).toBeEnabled();
      expect(privacyBtn).toBeEnabled();
    });
  });
});