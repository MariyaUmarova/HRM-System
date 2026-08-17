import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InterviewAnalysisPrototype } from "@/components/interview-analysis/InterviewAnalysisPrototype";

async function showSyntheticResult(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Загрузить тестовый пример" }));
  await user.click(screen.getByRole("button", { name: /3 Контекст и результат/ }));
  await user.click(screen.getByRole("button", { name: "Показать тестовый результат" }));
}

describe("InterviewAnalysisPrototype", () => {
  it("shows an evidence-linked synthetic result without claiming that AI ran", async () => {
    const user = userEvent.setup();
    render(<InterviewAnalysisPrototype />);

    await showSyntheticResult(user);

    expect(screen.getByText("Синтетический тестовый результат")).toBeInTheDocument();
    expect(screen.getAllByText(/Доказательство из материала:/)).toHaveLength(4);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Это не ответ AI и не рекомендация по найму",
    );
  });

  it("does not pretend to analyse arbitrary material while AI is disconnected", async () => {
    const user = userEvent.setup();
    render(<InterviewAnalysisPrototype />);

    await user.type(screen.getByRole("textbox", { name: "Критерии вакансии" }), "Новый критерий");
    await user.click(screen.getByRole("button", { name: /2 Материалы/ }));
    await user.type(screen.getByRole("textbox", { name: "Заметки или транскрипт" }), "Новые заметки");
    await user.click(screen.getByRole("button", { name: "Перейти к контексту" }));
    await user.click(screen.getByRole("button", { name: "Показать тестовый результат" }));

    expect(screen.queryByText("Синтетический тестовый результат")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Произвольный материал не отправлен",
    );
  });

  it("accepts combined text, audio and video input modes without uploading file contents", async () => {
    const user = userEvent.setup();
    render(<InterviewAnalysisPrototype />);

    await user.click(screen.getByRole("button", { name: /2 Материалы/ }));
    await user.click(screen.getByRole("checkbox", { name: /Аудиозапись/ }));
    await user.click(screen.getByRole("checkbox", { name: /Видеозапись/ }));

    const input = screen.getByLabelText("Аудио или видеозапись");
    const audio = new File(["audio"], "interview.mp3", { type: "audio/mpeg" });
    const video = new File(["video"], "interview.mp4", { type: "video/mp4" });
    await user.upload(input, [audio, video]);

    expect(screen.getByText("interview.mp3")).toBeInTheDocument();
    expect(screen.getByText("interview.mp4")).toBeInTheDocument();
    expect(screen.getByText(/транскрибация, разделение спикеров/)).toBeInTheDocument();
    expect(screen.getByText(/аудиодорожка плюс проверяемые наблюдения/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "содержимое файла никуда не загружено",
    );
  });

  it("rejects unsupported media formats clearly", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<InterviewAnalysisPrototype />);

    await user.click(screen.getByRole("button", { name: /2 Материалы/ }));
    await user.click(screen.getByRole("checkbox", { name: /Аудиозапись/ }));
    await user.upload(
      screen.getByLabelText("Аудио или видеозапись"),
      new File(["data"], "interview.zip", { type: "application/zip" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("Формат не поддерживается");
    expect(screen.queryByText("interview.zip")).not.toBeInTheDocument();
  });

  it("requires a fresh human confirmation after the result is edited", async () => {
    const user = userEvent.setup();
    render(<InterviewAnalysisPrototype />);

    await showSyntheticResult(user);

    const confirmation = screen.getByRole("checkbox", {
      name: /Я проверил\(а\) факты, выводы, доказательства, риски/,
    });
    const copy = screen.getByRole("button", { name: "Скопировать подтверждённый текст" });

    expect(copy).toBeDisabled();
    await user.click(confirmation);
    expect(copy).toBeEnabled();

    await user.type(screen.getByRole("textbox", { name: "Вывод 1" }), " Уточнение");
    expect(confirmation).not.toBeChecked();
    expect(copy).toBeDisabled();
  });

  it("copies only the confirmed draft and never sends it to Huntflow", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<InterviewAnalysisPrototype />);

    await showSyntheticResult(user);
    await user.click(
      screen.getByRole("checkbox", {
        name: /Я проверил\(а\) факты, выводы, доказательства, риски/,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Скопировать подтверждённый текст" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "Отправить в Huntflow" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("В Huntflow ничего не отправлено");
  });
});
