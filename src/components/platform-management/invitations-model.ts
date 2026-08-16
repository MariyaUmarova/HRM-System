export type InviteRole = "recruiter" | "customer";

export interface InviteDraftInput {
  email: string;
  role: InviteRole;
  department: string;
  position: string;
}

export interface InviteDraft extends InviteDraftInput {
  id: string;
  roleLabel: string;
  status: "Черновик";
}

export interface InviteErrors {
  email?: string;
  department?: string;
  position?: string;
}

export function validateInvite(input: InviteDraftInput): InviteErrors {
  const errors: InviteErrors = {};
  const email = input.email.trim().toLocaleLowerCase("en-US");

  if (!/^[^@\s]+@ivideon\.com$/.test(email)) {
    errors.email = "Используйте корпоративную почту в домене @ivideon.com.";
  }

  if (input.role === "customer") {
    if (!input.department.trim()) {
      errors.department = "Для заказчика укажите отдел.";
    }
    if (!input.position.trim()) {
      errors.position = "Для заказчика укажите должность.";
    }
  }

  return errors;
}

export function createInviteDraft(input: InviteDraftInput, sequence: number): InviteDraft {
  return {
    id: `invite-${sequence}`,
    email: input.email.trim().toLocaleLowerCase("en-US"),
    role: input.role,
    roleLabel: input.role === "recruiter" ? "Рекрутер" : "Заказчик",
    department: input.role === "customer" ? input.department.trim() : "",
    position: input.role === "customer" ? input.position.trim() : "",
    status: "Черновик",
  };
}
