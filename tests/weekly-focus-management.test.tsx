import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { WeeklyFocusLiveCard } from "@/components/home/WeeklyFocusLiveCard";
import { WeeklyFocusManager } from "@/components/platform-management/WeeklyFocusManager";
import {
  __resetWeeklyFocusStoreForTests,
  closeWeeklyFocusItem,
  getWeeklyFocusServerSnapshot,
  getWeeklyFocusSnapshot,
  upsertWeeklyFocusItem,
} from "@/lib/adapters/weekly-focus.store";

const STORAGE_KEY = "ivideon_hr_hub_weekly_focus_v1";

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

    upsertWeeklyFocusItem({ ...created, title: "Проверить shortlist — обновлено" });
    expect(getWeeklyFocusSnapshot().items.find((item) => item.id === created.id)?.title).toBe(
      "Проверить shortlist — обновлено",
    );

    closeWeeklyFocusItem(created.id);
    expect(getWeeklyFocusSnapshot().items.some((item) => item.id === created.id)).toBe(false);
  });

  it("keeps a saved focus across a full-page role switch in the same work week", () => {
    const created = upsertWeeklyFocusItem({
      title: "Фокус переживает переключение роли",
      priorityNote: "Проверка reload persistence",
      ownerRecruiterId: "rec-1",
      vacancyRef: {
        externalId: "hf-vac-reload",
        title: "Synthetic reload vacancy",
        department: "QA",
        huntflowUrl: "https://huntflow.example/vacancy/reload",
      },
    });

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);

    for (const boundary of ["rangeStart", "rangeEnd"] as const) {
      const changedTimestamp = new Date(stored[boundary]);
      changedTimestamp.setMilliseconds(changedTimestamp.getMilliseconds() === 0 ? 1 : 0);
      stored[boundary] = changedTimestamp.toISOString();
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    __resetWeeklyFocusStoreForTests();

    const hydrated = getWeeklyFocusSnapshot();
    expect(hydrated.items.some((item) => item.id === created.id)).toBe(true);
  });

  it("allows only Huntflow product domains and the synthetic UAT host", () => {
    for (const huntflowUrl of [
      "https://huntflow.example/vacancy/test",
      "https://huntflow.ru/account/vacancy/1",
      "https://app.huntflow.ru/account/vacancy/1",
      "https://huntflow.kz/account/vacancy/1",
      "https://app.huntflow.uz/account/vacancy/1",
    ]) {
      expect(() =>
        upsertWeeklyFocusItem({
          title: `Безопасная ссылка ${huntflowUrl}`,
          priorityNote: "Разрешённый Huntflow host",
          ownerRecruiterId: "rec-1",
          vacancyRef: {
            externalId: `hf-${huntflowUrl}`,
            title: "Safe ref",
            department: "QA",
            huntflowUrl,
          },
        }),
      ).not.toThrow();
    }

    for (const huntflowUrl of ["javascript:alert(1)", "https://example.com/huntflow", "https://huntflow.ru.evil.example/vacancy/1"]) {
      expect(() =>
        upsertWeeklyFocusItem({
          title: "Небезопасный фокус",
          priorityNote: "Не должен сохраниться",
          ownerRecruiterId: "rec-1",
          vacancyRef: {
            externalId: "hf-bad",
            title: "Bad ref",
            department: "QA",
            huntflowUrl,
          },
        }),
      ).toThrow("Unsafe Huntflow URL");
    }
  });

  it("ignores tampered browser state instead of rendering an unsafe link", () => {
    const week = getWeeklyFocusServerSnapshot();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rangeStart: week.rangeStart,
        rangeEnd: week.rangeEnd,
        items: [
          {
            id: "focus-bad",
            title: "Подменённый фокус",
            priorityNote: "tampered",
            ownerRecruiterId: "rec-1",
            vacancyRef: {
              externalId: "hf-bad",
              title: "Bad ref",
              department: "QA",
              huntflowUrl: "https://example.com/phishing",
            },
          },
        ],
      }),
    );
    __resetWeeklyFocusStoreForTests();

    const hydrated = getWeeklyFocusSnapshot();
    expect(hydrated.items.some((item) => item.id === "focus-bad")).toBe(false);
    expect(hydrated.items.some((item) => item.id === "focus-1")).toBe(true);
  });

  it("shows a recruiter only their own active focus", () => {
    render(<WeeklyFocusLiveCard recruiterId="rec-1" />);

    expect(screen.getByText("Закрыть первичный поиск Backend-разработчика")).toBeInTheDocument();
    expect(screen.queryByText("Вернуться к отклику по DevOps-инженеру")).not.toBeInTheDocument();
  });
});

describe("WeeklyFocusManager", () => {
  it("uses product language instead of environment and implementation jargon", () => {
    render(<WeeklyFocusManager />);

    expect(screen.getByText(/Сейчас изменения сохраняются только в этом браузере/)).toBeInTheDocument();
    expect(screen.getByText(/Руководитель подбора и HRD управляют приоритетами команды/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Ссылка на вакансию в Huntflow" })).toBeInTheDocument();
    expect(screen.queryByText(/durable audit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/текущего UAT/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/deep-link/i)).not.toBeInTheDocument();
  });

  it("rejects a non-Huntflow HTTPS link in the form without crashing or saving", async () => {
    const user = userEvent.setup();
    render(<WeeklyFocusManager />);
    const before = getWeeklyFocusSnapshot().items.length;

    await user.type(screen.getByRole("textbox", { name: "Задача недельного фокуса" }), "Фокус с чужой ссылкой");
    await user.type(screen.getByRole("textbox", { name: "Приоритет недельного фокуса" }), "Не сохранять");
    await user.type(screen.getByRole("textbox", { name: "Huntflow ID вакансии" }), "hf-bad-ui");
    await user.type(screen.getByRole("textbox", { name: "Название вакансии для фокуса" }), "Bad UI ref");
    await user.type(
      screen.getByRole("textbox", { name: "Ссылка на вакансию в Huntflow" }),
      "https://example.com/phishing",
    );
    await user.click(screen.getByRole("button", { name: "Сохранить фокус" }));

    expect(screen.getByText("Укажите ссылку на вакансию в Huntflow.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Исправьте поля. Фокус не изменён.");
    expect(getWeeklyFocusSnapshot().items).toHaveLength(before);
  });

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
    await user.type(
      screen.getByRole("textbox", { name: "Ссылка на вакансию в Huntflow" }),
      "https://huntflow.example/vacancy/uat",
    );
    await user.click(screen.getByRole("button", { name: "Сохранить фокус" }));

    expect(screen.getAllByText("Новый UAT-фокус")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("Изменение видно в карточке рекрутера");
  });

  it("requires explicit confirmation before closing and then removes the focus from recruiter view", async () => {
    const user = userEvent.setup();
    render(
      <>
        <WeeklyFocusManager />
        <WeeklyFocusLiveCard recruiterId="rec-1" />
      </>,
    );

    expect(screen.getAllByText("Закрыть первичный поиск Backend-разработчика")).toHaveLength(2);

    const closeButtons = screen.getAllByRole("button", { name: "Закрыть" });
    await user.click(closeButtons[0]);

    expect(screen.getByRole("button", { name: "Подтвердить закрытие" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeInTheDocument();
    expect(screen.getAllByText("Закрыть первичный поиск Backend-разработчика")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Подтвердить закрытие" }));
    expect(screen.queryByText("Закрыть первичный поиск Backend-разработчика")).not.toBeInTheDocument();
  });
});
