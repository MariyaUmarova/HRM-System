import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HrRadar } from "@/components/hr-radar/HrRadar";
import {
  HR_NEWS_ITEMS,
  HR_NEWS_SOURCES,
  searchHrNews,
} from "@/components/hr-radar/hr-news";

describe("HR news data", () => {
  it("keeps every material attributed to a unique HTTPS source URL", () => {
    const urls = HR_NEWS_ITEMS.map((item) => item.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith("https://"))).toBe(true);
    expect(HR_NEWS_ITEMS.every((item) => item.source && item.publishedLabel)).toBe(true);
  });

  it("distinguishes the direct RSS adapter from ChatGPT web discovery", () => {
    expect(HR_NEWS_SOURCES.filter((source) => source.updateMode === "Автоматически")).toHaveLength(1);
    expect(HR_NEWS_SOURCES.filter((source) => source.updateMode === "Через веб-поиск")).toHaveLength(2);
    expect(HR_NEWS_SOURCES.find((source) => source.name === "Минтруд России")?.updateMode).toBe(
      "Автоматически",
    );
  });

  it("sorts matches by publication date and searches summaries and tags", () => {
    const matches = searchHrNews(HR_NEWS_ITEMS, "интервью", "Все темы");
    expect(matches.map((item) => item.id)).toContain("hh-call-transcripts-2026");
    expect(matches.map((item) => item.publishedAt)).toEqual(
      [...matches.map((item) => item.publishedAt)].sort().reverse(),
    );
  });
});

describe("HrRadar", () => {
  it("shows real source links and an explicit automatic-review notice", () => {
    render(<HrRadar items={HR_NEWS_ITEMS} sources={HR_NEWS_SOURCES} />);

    expect(screen.getByText(/Автосбор источников: ежедневно в 09:00 МСК/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Открыть источник ↗" })).toHaveLength(
      HR_NEWS_ITEMS.length,
    );
    expect(
      screen.getByText(/Новые ссылки сначала попадают в закрытую очередь «На проверке»/),
    ).toBeInTheDocument();
    expect(screen.getByText(/ChatGPT с веб-поиском проверяют/)).toBeInTheDocument();
    expect(screen.getByText(/не публикуются автоматически/)).toBeInTheDocument();
  });

  it("filters the feed by topic and text without hiding attribution", async () => {
    const user = userEvent.setup();
    render(<HrRadar items={HR_NEWS_ITEMS} sources={HR_NEWS_SOURCES} />);

    await user.click(screen.getByRole("button", { name: "AI и HR Tech" }));
    expect(screen.getByRole("status")).toHaveTextContent("Найдено: 2");

    await user.type(screen.getByRole("searchbox", { name: "Поиск по HR-новостям" }), "CIPD");
    expect(screen.getByRole("status")).toHaveTextContent("Найдено: 1");
    expect(screen.getByText("CIPD о применении AI в государственных службах занятости")).toBeInTheDocument();
  });

  it("saves a material in the current tab and can show saved items only", async () => {
    const user = userEvent.setup();
    render(<HrRadar items={HR_NEWS_ITEMS} sources={HR_NEWS_SOURCES} />);

    const firstSave = screen.getAllByRole("button", { name: "Сохранить" })[0];
    await user.click(firstSave);

    expect(screen.getByText("Сохранено в этой вкладке").parentElement).toHaveTextContent("1");
    await user.click(screen.getByRole("checkbox", { name: "Только сохранённые" }));
    expect(screen.getByRole("status")).toHaveTextContent("Найдено: 1");
  });

  it("shows a clear empty state for unmatched filters", async () => {
    const user = userEvent.setup();
    render(<HrRadar items={HR_NEWS_ITEMS} sources={HR_NEWS_SOURCES} />);

    await user.type(
      screen.getByRole("searchbox", { name: "Поиск по HR-новостям" }),
      "несуществующая тема",
    );

    expect(screen.getByText("Материалы не найдены")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Найдено: 0");
  });
});
