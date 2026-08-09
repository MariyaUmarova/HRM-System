import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStoreForTests,
  accept,
  assignRecruiter,
  getAllRequestsSnapshot,
  getByToken,
  listForManagement,
  returnForRevision,
  saveDraft,
  submit,
} from "@/lib/adapters/requests.store";

beforeEach(() => {
  window.localStorage.clear();
  __resetStoreForTests();
});

describe("intake requests store (mock adapter)", () => {
  it("seeds deterministic sample requests on first read", async () => {
    const all = await listForManagement();
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((r) => r.token && r.id)).toBe(true);
  });

  it("submitted -> accepted -> assigned follows the approved status flow", async () => {
    const target = (await listForManagement()).find((r) => r.status === "submitted");
    expect(target).toBeTruthy();
    if (!target) return;

    const accepted = await accept(target.id);
    expect(accepted.status).toBe("accepted");
    expect(accepted.assignedRecruiterId).toBeNull();

    const assigned = await assignRecruiter(target.id, "rec-2");
    expect(assigned.status).toBe("assigned");
    expect(assigned.assignedRecruiterId).toBe("rec-2");

    // History records every transition for audit purposes.
    const statuses = assigned.history.map((h) => h.status);
    expect(statuses).toContain("submitted");
    expect(statuses).toContain("accepted");
    expect(statuses).toContain("assigned");
  });

  it("returning for revision records the comment and status, and re-editing then re-submitting works", async () => {
    const target = (await listForManagement()).find((r) => r.status === "submitted");
    expect(target).toBeTruthy();
    if (!target) return;

    const returned = await returnForRevision(target.id, "Уточните вилку компенсации");
    expect(returned.status).toBe("returned");
    expect(returned.history.at(-1)?.comment).toBe("Уточните вилку компенсации");

    const edited = await saveDraft(returned.token, { comment: "Вилка уточнена: 150-180k" });
    expect(edited.comment).toBe("Вилка уточнена: 150-180k");

    const resubmitted = await submit(returned.token);
    expect(resubmitted.status).toBe("submitted");
  });

  it("mutations are visible both via getByToken (customer side) and listForManagement (lead side)", async () => {
    const before = await getByToken("demo-token-genstoret");
    expect(before?.status).toBe("submitted");

    await accept("req-1");

    const after = await getByToken("demo-token-genstoret");
    expect(after?.status).toBe("accepted");

    const managementView = await listForManagement();
    expect(managementView.find((r) => r.id === "req-1")?.status).toBe("accepted");
  });

  it("getAllRequestsSnapshot returns a stable reference until the store is mutated", async () => {
    const first = getAllRequestsSnapshot();
    const second = getAllRequestsSnapshot();
    expect(first).toBe(second);

    await accept("req-1");
    const third = getAllRequestsSnapshot();
    expect(third).not.toBe(first);
  });
});
