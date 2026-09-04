import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChecklistCard } from "@/components/recruit/ChecklistCard";

describe("Recruit checklist card parity", () => {
  it("shows the source stage and keeps progress visual without extra percentage copy", () => {
    render(
      <ChecklistCard
        id="brief-checklist"
        title="Чек-лист брифа"
        stage="Бриф вакансии"
        items={["Согласован профиль", "Уточнены ограничения"]}
      />,
    );

    expect(screen.getByText("Бриф вакансии")).toBeInTheDocument();
    expect(screen.getByLabelText("Выполнено 0%")).toBeInTheDocument();
    expect(screen.queryByText("0% выполнено")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Согласован профиль"));

    expect(screen.getByLabelText("Выполнено 50%")).toBeInTheDocument();
    expect(screen.queryByText("50% выполнено")).not.toBeInTheDocument();
  });
});
