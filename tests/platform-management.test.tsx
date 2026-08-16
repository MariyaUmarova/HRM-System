import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PlatformManagementPrototype } from "@/components/platform-management/PlatformManagementPrototype";
import {
  createInviteDraft,
  validateInvite,
} from "@/components/platform-management/invitations-model";

describe("invitation rules", () => {
  it("accepts only an exact @ivideon.com corporate domain", () => {
    expect(
      validateInvite({
        email: "recruiter@ivideon.com",
        role: "recruiter",
        department: "",
        position: "",
      }),
    ).toEqual({});
    expect(
      validateInvite({
        email: "recruiter@ivideon.com.example.org",
        role: "recruiter",
        department: "",
        position: "",
      }).email,
    ).toBeDefined();
    expect(
      validateInvite({
        email: "recruiter@gmail.com",
        role: "recruiter",
        department: "",
        position: "",
      }).email,
    ).toBeDefined();
  });

  it("requires department and position only for a customer", () => {
    const customerErrors = validateInvite({
      email: "customer@ivideon.com",
      role: "customer",
      department: "",
      position: "",
    });
    expect(customerErrors.department).toBeDefined();
    expect(customerErrors.position).toBeDefined();

    const recruiter = createInviteDraft(
      {
        email: "recruiter@ivideon.com",
        role: "recruiter",
        department: "Не должно сохраниться",
        position: "Не должно сохраниться",
      },
      1,
    );
    expect(recruiter.department).toBe("");
    expect(recruiter.position).toBe("");
  });
});

describe("PlatformManagementPrototype", () => {
  it("offers only recruiter and customer roles", () => {
    render(<PlatformManagementPrototype managerLabel="Руководитель подбора" />);

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["Рекрутер", "Заказчик"]);
    expect(screen.queryByRole("option", { name: "HRD" })).not.toBeInTheDocument();
  });

  it("shows customer-specific fields and validates them before preparing a draft", async () => {
    const user = userEvent.setup();
    render(<PlatformManagementPrototype managerLabel="HRD" />);

    await user.type(screen.getByRole("textbox", { name: "Корпоративная почта" }), "customer@ivideon.com");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Роль приглашённого пользователя" }),
      "customer",
    );
    await user.click(screen.getByRole("button", { name: "Подготовить приглашение" }));

    expect(screen.getByText("Для заказчика укажите отдел.")).toBeInTheDocument();
    expect(screen.getByText("Для заказчика укажите должность.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Никакие данные не отправлены");
  });

  it("prepares a transparent client-only invitation draft", async () => {
    const user = userEvent.setup();
    render(<PlatformManagementPrototype managerLabel="Руководитель подбора" />);

    await user.type(screen.getByRole("textbox", { name: "Корпоративная почта" }), "Recruiter@Ivideon.com");
    await user.click(screen.getByRole("button", { name: "Подготовить приглашение" }));

    expect(screen.getByText("recruiter@ivideon.com")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Письмо не отправлено");
    expect(screen.getByText("Письмо не отправлено · аккаунт не создан")).toBeInTheDocument();
  });
});
