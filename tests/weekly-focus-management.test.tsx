import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { WeeklyFocusLiveCard } from "@/components/home/WeeklyFocusLiveCard";
import { WeeklyFocusManager } from "@/components/platform-management/WeeklyFocusManager";
import {
  __resetWeeklyFocusStoreForTests,
  closeWeeklyFocusItem,
  getWeeklyFocusSnapshot,
  upsertWeeklyFocusItem,
} from "@/lib/adapters/weekly-focus.store";

beforeEach(() => {
  window.localStorage.clear();
  __resetWeeklyFocusStoreForTests();
});

describe("weekly focus store", () => {
  it("creates, updates and closes a focus without mutating Huntflow", () => {
    const created = upsertWeeklyFocusItem({
      title: "Проверить shortlist",
      priorityNote: "Показать заказчику до четверга",
      ownerRecruiterId: "rec-1",
      vacancyRef: {
        externalId: "hf-vac-test",
        title: "Synthetic QA vacancy",
        department: "QA",
        huntflowUrl: "https://huntflow.example/vacancy/test",
      },
    });

    expect(getWeeklyFocusSnapshot().items.some((item) => item.id === created.id)).toBe(true);

    upsertWeeklyFocusItem({
      ...created,
      title: "Проверить shortlist — обновлено",
    });
    expect(getWeeklyFocusSnapshot().items.find((item) => item.id === created.id)?.title).toBe(
      "Проверить shortlist — обновлено",
    );

    closeWeeklyFocusItem(created.id);
    expect(getWeeklyFocusSnapshot().items.some((item) => item.id === created.id)).toBe(false);
  });

  it("shows a recruiter only their own active focus", () => {
    render(<WeeklyFocusLiveCard recruiterId="rec-1" />);

    expect(screen.getByText("Закрыть первичный поиск Backend-разработчика")).toBeInTheDocument();
    expect(screen.queryByText("Вернуться к отклику по DevOps-инженеру")).not.toBeInTheDocument();
  });
});

describe("WeeklyFocusManager", () => {
  it("adds a human-confirmed focus and updates the recruiter card in the same browser", async () => {
    const user = userEvent.setup();
    render(
      <>
        <WeeklyFocusManager />
        <WeeklyFocusLiveCard recruiterId="rec-1" />
      </>,
    );

    await user.type(screen.getByRole("textbox", { name: "Задача недельного фокуса" }), "Новый UAT-фокус");
    await user.type(screen.getByRole("textbox", { name: "Приоритет недельного фокуса" }), "Проверить до пятницы");
    await user.type(screen.getByRole("textbox", { name: "Huntflow ID вакансии" }), "hf-vac-uat");
    await user.type(screen.getByRole("textbox", { name: "Название вакансии для фокуса" }), "UAT vacancy");
    await user.type(screen.getByRole("textbox", { name: "Deep-link Huntflow" }), "https://huntflow.example/vacancy/uat");
    await user.click(screen.getByRole("button", { name: "Сохранить фокус" }));

    expect(screen.getAllByText("Новый UAT-фокус")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("Изменение видно в карточке рекрутера");
  });

  it("requires a second explicit action before closing an active focus", async () => {
    const user = userEvent.setup();
    render(<WeeklyFocusManager />);

    const closeButtons = screen.getAllByRole("button", { name: "Закрыть" });
    await user.click(closeButtons[0]);

    expect(screen.getByRole("button", { name: "Подтвердить закрытие" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeInTheDocument();
  });
});
