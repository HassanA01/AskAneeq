import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock @openai/apps-sdk-ui components
vi.mock("@openai/apps-sdk-ui/components/Avatar", () => ({
  Avatar: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

vi.mock("@openai/apps-sdk-ui/components/Badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

// Mock @modelcontextprotocol/ext-apps/react
vi.mock("@modelcontextprotocol/ext-apps/react", () => ({
  useApp: vi.fn(),
}));

// Mock profile image asset
vi.mock("../assets/profile-image", () => ({
  profileImage: "data:image/png;base64,mock",
}));
