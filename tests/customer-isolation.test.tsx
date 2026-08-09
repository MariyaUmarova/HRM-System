import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CustomerLayout from "@/app/(customer)/layout";
import { canAccess } from "@/lib/auth/roles";
import { NAV_ITEMS } from "@/components/app-shell/nav-items";
import { getByToken } from "@/lib/adapters/requests.store";
import { CustomerRequestView } from "@/components/requests/CustomerRequestView";

describe("customer isolation", () => {
  it("customer role is denied every internal navigation area", () => {
    const reachableForCustomer = NAV_ITEMS.filter((item) => canAccess("customer", item.area));
    expect(reachableForCustomer).toHaveLength(0);
  });

  it("the isolated customer shell renders no link to internal workspace routes", () => {
    render(
      <CustomerLayout>
        <p>Форма заявки</p>
      </CustomerLayout>,
    );
    const links = screen.queryAllByRole("link");
    const internalLinks = links.filter((el) =>
      ["/workflow", "/knowledge-base", "/requests", "/platform-management", "/offer-center"].some((path) =>
        el.getAttribute("href")?.startsWith(path),
      ),
    );
    expect(internalLinks).toHaveLength(0);
    expect(screen.getByText("Форма заявки")).toBeInTheDocument();
  });

  it("getByToken only ever returns the single matching request, never a list", async () => {
    const request = await getByToken("demo-token-genstoret");
    expect(request).not.toBeNull();
    expect(request?.token).toBe("demo-token-genstoret");
  });

  it("getByToken returns null for an unknown or guessed token (no enumeration)", async () => {
    const request = await getByToken("some-guessed-token-xyz");
    expect(request).toBeNull();
  });

  it("the customer request view shows a not-found message for an invalid link, not other requests' data", async () => {
    render(<CustomerRequestView token="not-a-real-token" />);
    await waitFor(() => expect(screen.getByText(/ссылка недействительна/i)).toBeInTheDocument());
    expect(screen.queryByText(/Специалист поддержки продаж/)).not.toBeInTheDocument();
  });

  it("the customer request view only ever renders the one request matching its own token", async () => {
    render(<CustomerRequestView token="demo-token-analytics" />);
    await waitFor(() => expect(screen.getByDisplayValue("Аналитик данных")).toBeInTheDocument());
    expect(screen.queryByDisplayValue(/Специалист поддержки продаж/)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(/Инженер техподдержки/)).not.toBeInTheDocument();
  });
});
