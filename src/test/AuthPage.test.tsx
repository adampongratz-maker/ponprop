import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", () => {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signUp: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    supabase: {
      auth,
    },
  };
});

const mockedSupabase = supabase as unknown as {
  auth: {
    getSession: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
  };
};

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls supabase.auth.signUp when Create Account is clicked", async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createAccountButton = screen.getByRole("button", { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "StrongPass1" } });
    fireEvent.click(createAccountButton);

    await waitFor(() => {
      expect(mockedSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "StrongPass1",
      });
    });
  });

  it("calls supabase.auth.signInWithPassword when Sign In is submitted", async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    const emailInput = await screen.findByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "StrongPass1" } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockedSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "StrongPass1",
      });
    });
  });
});
