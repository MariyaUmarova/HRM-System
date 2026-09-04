import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "@/components/app-shell/AppShell";

describe("AppShell profile header", () => {
  it("shows the server-provided role as profile information", () => {
    render(
      <AppShell role="recruiter">
        <p>Рабочая область</p>
      </AppShell>,
    );

    expect(screen.getByLabelText("Текущий профиль: Рекрутер")).toBeInTheDocument();
    expect(screen.getByText("Рабочая область")).toBeInTheDocument();
  });

  it("keeps workflow on Home instead of duplicating it in the persistent sidebar", () => {
    render(
      <AppShell role="recruiter">
        <p>Рабочая область</p>
      </AppShell>,
    );

    expect(screen.queryByRole("link", { name: /Рабочий маршрут/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Рабочие ситуации/ })).toHaveAttribute("href", "/scenarios");
  });

  it("keeps the standalone global-search copy", () => {
    render(
      <AppShell role="recruiter">
        <p>Рабочая область</p>
      </AppShell>,
    );

    expect(screen.getByRole("searchbox", { name: "Глобальный поиск" })).toHaveAttribute(
      "placeholder",
      "Поиск по ситуациям, скриптам, шагам и источникам",
    );
  });

  it("does not expose a role switcher in the site menu", () => {
    render(
      <AppShell role="head_of_recruitment">
        <p>Рабочая область</p>
      </AppShell>,
    );

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Предпросмотр роли (dev)")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Текущий профиль: Руководитель подбора")).toBeInTheDocument();
  });
});
