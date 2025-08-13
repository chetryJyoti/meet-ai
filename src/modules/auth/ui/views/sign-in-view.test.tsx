/**
 * Tests for SignInView
 *
 * Framework: Jest
 * Libraries: @testing-library/react, @testing-library/jest-dom
 *
 * These tests cover:
 * - Rendering of headings, inputs, and action buttons
 * - Validation with Zod via react-hook-form (invalid email, empty password)
 * - Email/password submission success path (router.push called)
 * - Email/password onError callback path (error alert message shown, loading reset)
 * - Email/password thrown error path (caught in catch, error shown, loading reset)
 * - Social sign-in for Google and GitHub: success (no error) and failure (error alert)
 * - isLoading states disable inputs/buttons and show "Signing in..." text
 * - Password visibility toggle via the Eye/EyeOff button
 * - Navigation to sign-up via Link-like button
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Mock next/navigation router
jest.mock("next/navigation", () => {
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
  };
});

// Mock next/image to avoid Next.js specific behavior in tests
jest.mock("next/image", () => (props: any) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />;
});

// Mock UI components with pass-through to simplify DOM
jest.mock("@/components/ui/button", () => {
  return {
    Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
  };
});
jest.mock("@/components/ui/input", () => {
  return {
    Input: (props: any) => <input {...props} />,
  };
});
jest.mock("@/components/ui/card", () => {
  return {
    Card: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    CardContent: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  };
});
jest.mock("@/components/ui/form", () => {
  const React = require("react");
  return {
    Form: ({ children }: any) => <>{children}</>,
    FormControl: ({ children }: any) => <>{children}</>,
    FormField: ({ render, ...rest }: any) => render({ field: { name: rest.name, value: "", onChange: jest.fn(), onBlur: jest.fn(), ref: jest.fn() } }),
    FormItem: ({ children }: any) => <div>{children}</div>,
    FormLabel: ({ children }: any) => <label>{children}</label>,
    FormMessage: ({ children }: any) => <p>{children}</p>,
  };
});
jest.mock("@/components/ui/alert", () => {
  return {
    Alert: ({ children, ...rest }: any) => <div role="alert" {...rest}>{children}</div>,
    AlertTitle: ({ children }: any) => <div>{children}</div>,
  };
});

// Spies for authClient and router
const pushSpy = jest.fn();

// Override useRouter specifically to capture push calls
jest.mocked(require("next/navigation")).useRouter = () => ({ push: pushSpy });

const emailMock = jest.fn();
const socialMock = jest.fn();

// Mock authClient
jest.mock("@/lib/auth-client", () => {
  return {
    authClient: {
      signIn: {
        email: (...args: any[]) => emailMock(...args),
        social: (...args: any[]) => socialMock(...args),
      },
    },
  };
});

// Import the component under test AFTER mocks
import { SignInView } from "./sign-in-view";

// Helpers
const fillEmailAndPassword = (email: string, password: string) => {
  const emailInput = screen.getByPlaceholderText(/enter your email/i) as HTMLInputElement;
  const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;

  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });

  return { emailInput, passwordInput };
};

describe("SignInView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders headings, inputs, and primary actions", () => {
    render(<SignInView />);

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with github/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("validates email and password with Zod and shows messages", async () => {
    render(<SignInView />);

    // Submit with empty fields
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    // react-hook-form + zodResolver will set errors
    // We expect some validation messages (the exact text comes from the schema and form components)
    await waitFor(() => {
      // Email error; schema message: "Invalid email address"
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      // Password error; schema min(1) message: "Password is required"
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    // Fix email but leave password empty
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      // Only password error remains
      expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("successful email/password sign-in calls router.push('/')", async () => {
    emailMock.mockImplementation(async (_payload, callbacks) => {
      // Simulate success path by invoking onSuccess callback
      callbacks?.onSuccess?.();
      return Promise.resolve();
    });

    render(<SignInView />);

    fillEmailAndPassword("user@example.com", "secret");

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    });

    await waitFor(() => {
      expect(emailMock).toHaveBeenCalledWith(
        { email: "user@example.com", password: "secret" },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
      expect(pushSpy).toHaveBeenCalledWith("/");
    });
  });

  it("email/password onError callback shows error alert and resets loading", async () => {
    emailMock.mockImplementation(async (_payload, callbacks) => {
      callbacks?.onError?.({ error: { message: "Invalid credentials" } });
      return Promise.resolve();
    });

    render(<SignInView />);

    const { emailInput, passwordInput } = fillEmailAndPassword("user@example.com", "badpass");
    expect(emailInput).not.toBeDisabled();
    expect(passwordInput).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    });

    // While in-flight, button should show "Signing in..." briefly; final state resets
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^sign in$/i })).toBeEnabled();
    });

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("email/password thrown error goes to catch and shows alert", async () => {
    emailMock.mockRejectedValueOnce(new Error("Service unavailable"));

    render(<SignInView />);

    fillEmailAndPassword("user@example.com", "secret");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^sign in$/i })).toBeEnabled();
    });

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("password toggle shows/hides password field type", async () => {
    render(<SignInView />);

    const pwd = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
    expect(pwd.type).toBe("password");

    // Find the toggle button; the button doesn't have text, but toggles Eye/EyeOff icons.
    // It is the only button without text near the password input; we'll query by role and index.
    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons.find(
      (b) =>
        b !== screen.getByRole("button", { name: /continue with google/i }) &&
        b !== screen.getByRole("button", { name: /continue with github/i }) &&
        b !== screen.getByRole("button", { name: /^sign in$/i }) &&
        b !== screen.getByRole("button", { name: /sign up/i }) &&
        b !== screen.queryByRole("button", { name: /terms of service/i }) &&
        b !== screen.queryByRole("button", { name: /privacy policy/i })
    );
    expect(toggleBtn).toBeDefined();

    if (!toggleBtn) throw new Error("Password toggle button not found");

    fireEvent.click(toggleBtn);
    expect((screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement).type).toBe("text");

    fireEvent.click(toggleBtn);
    expect((screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement).type).toBe("password");
  });

  it("social sign-in: Google success leaves no error", async () => {
    socialMock.mockResolvedValueOnce(undefined);

    render(<SignInView />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    });

    await waitFor(() => {
      expect(socialMock).toHaveBeenCalledWith({ provider: "google" });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("social sign-in: GitHub failure shows provider-specific error", async () => {
    socialMock.mockRejectedValueOnce(new Error("OAuth down"));

    render(<SignInView />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));
    });

    await waitFor(() => {
      expect(socialMock).toHaveBeenCalledWith({ provider: "github" });
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/github sign in failed\. please try again\./i)).toBeInTheDocument();
    });
  });

  it("disables inputs and buttons while loading and restores after", async () => {
    // Keep emailMock pending until we resolve it manually to simulate loading
    let resolveCall: Function | undefined;
    emailMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveCall = resolve;
        })
    );

    render(<SignInView />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const signInButton = screen.getByRole("button", { name: /^sign in$/i });
    const googleButton = screen.getByRole("button", { name: /continue with google/i });
    const githubButton = screen.getByRole("button", { name: /continue with github/i });

    fillEmailAndPassword("user@example.com", "secret");

    await act(async () => {
      fireEvent.click(signInButton);
    });

    // Expect disabled during loading
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(googleButton).toBeDisabled();
    expect(githubButton).toBeDisabled();

    // Text changes to "Signing in..."
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    // Resolve the pending sign-in
    await act(async () => {
      resolveCall && resolveCall();
    });

    // After resolution, form should re-enable
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^sign in$/i })).toBeEnabled();
      expect(screen.getByPlaceholderText(/enter your email/i)).not.toBeDisabled();
      expect(screen.getByPlaceholderText(/enter your password/i)).not.toBeDisabled();
    });
  });

  it("navigates to sign up when clicking Sign up link button", async () => {
    render(<SignInView />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    });

    expect(pushSpy).toHaveBeenCalledWith("/sign-up");
  });
});