import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { LIMITS } from "../constants";
import { projectSchema } from "./project";
import { proposalSchema } from "./proposal";
import { proposalStatusSchema, userStatusSchema } from "./status";

const firstError = (schema: z.ZodType, data: unknown) => schema.safeParse(data).error?.issues[0].message;

// The limits come from the constants (PRD R8): the edges of each range pass, one past them fails.
describe("project schema", () => {
  const project = (changes: Record<string, unknown>) => ({
    title: "a".repeat(LIMITS.PROJECT_TITLE_MIN),
    description: "a".repeat(LIMITS.PROJECT_DESCRIPTION_MIN),
    budget: String(LIMITS.PROJECT_BUDGET_MIN),
    category: "id",
    ...changes,
  });

  it("title length follows LIMITS.PROJECT_TITLE_MIN..MAX", () => {
    expect(projectSchema.safeParse(project({ title: "a".repeat(LIMITS.PROJECT_TITLE_MAX) })).success).toBe(true);
    expect(firstError(projectSchema, project({ title: "" }))).toBe("عنوان ضروری است");
    expect(firstError(projectSchema, project({ title: "a".repeat(LIMITS.PROJECT_TITLE_MIN - 1) }))).toBe("حداقل 10 کاراکتر را وارد کنید");
    expect(firstError(projectSchema, project({ title: "a".repeat(LIMITS.PROJECT_TITLE_MAX + 1) }))).toBe("حداکثر 30 کاراکتر مجاز است");
  });

  it("description needs LIMITS.PROJECT_DESCRIPTION_MIN characters", () => {
    expect(firstError(projectSchema, project({ description: "" }))).toBe("توضیحات ضروری است");
    expect(firstError(projectSchema, project({ description: "a".repeat(LIMITS.PROJECT_DESCRIPTION_MIN - 1) }))).toBe(
      "حداقل 15 کاراکتر را وارد کنید"
    );
  });

  it("budget follows LIMITS.PROJECT_BUDGET_MIN..MAX and is read as a number", () => {
    expect(projectSchema.parse(project({ budget: String(LIMITS.PROJECT_BUDGET_MAX) })).budget).toBe(LIMITS.PROJECT_BUDGET_MAX);
    expect(projectSchema.parse(project({ budget: LIMITS.PROJECT_BUDGET_MIN })).budget).toBe(LIMITS.PROJECT_BUDGET_MIN);
    expect(firstError(projectSchema, project({ budget: "" }))).toBe("بودجه ضروری است");
    expect(firstError(projectSchema, project({ budget: String(LIMITS.PROJECT_BUDGET_MIN - 1) }))).toBe("مبلغ وارد شده نامعتبر است");
    expect(firstError(projectSchema, project({ budget: String(LIMITS.PROJECT_BUDGET_MAX + 1) }))).toBe("مبلغ وارد شده نامعتبر است");
  });
});

describe("proposal schema", () => {
  const proposal = (changes: Record<string, unknown>) => ({
    description: "a".repeat(LIMITS.PROPOSAL_DESCRIPTION_MIN),
    price: String(LIMITS.PROPOSAL_PRICE_MIN),
    duration: String(LIMITS.PROPOSAL_DURATION_MIN),
    ...changes,
  });

  it("the range edges pass", () => {
    expect(proposalSchema.parse(proposal({}))).toEqual({
      description: "a".repeat(LIMITS.PROPOSAL_DESCRIPTION_MIN),
      price: LIMITS.PROPOSAL_PRICE_MIN,
      duration: LIMITS.PROPOSAL_DURATION_MIN,
    });
    const max = { price: String(LIMITS.PROPOSAL_PRICE_MAX), duration: String(LIMITS.PROPOSAL_DURATION_MAX) };
    expect(proposalSchema.safeParse(proposal(max)).success).toBe(true);
  });

  it("one past the edges fails with the form's messages", () => {
    expect(firstError(proposalSchema, proposal({ description: "" }))).toBe("عنوان ضروری است");
    expect(firstError(proposalSchema, proposal({ description: "a".repeat(LIMITS.PROPOSAL_DESCRIPTION_MIN - 1) }))).toBe(
      "حداقل 10 کاراکتر را وارد کنید"
    );
    expect(firstError(proposalSchema, proposal({ price: "" }))).toBe("قیمت ضروری است");
    expect(firstError(proposalSchema, proposal({ price: String(LIMITS.PROPOSAL_PRICE_MIN - 1) }))).toBe("مبلغ وارد شده نامعتبر است");
    expect(firstError(proposalSchema, proposal({ price: String(LIMITS.PROPOSAL_PRICE_MAX + 1) }))).toBe("مبلغ وارد شده نامعتبر است");
    expect(firstError(proposalSchema, proposal({ duration: "" }))).toBe("مدت زمان ضروری است");
    expect(firstError(proposalSchema, proposal({ duration: String(LIMITS.PROPOSAL_DURATION_MIN - 1) }))).toBe("مدت زمان مجاز نمی باشد");
    expect(firstError(proposalSchema, proposal({ duration: String(LIMITS.PROPOSAL_DURATION_MAX + 1) }))).toBe("مدت زمان مجاز نمی باشد");
  });
});

describe("status schemas", () => {
  it("read the select's string as a STATUS code", () => {
    expect(proposalStatusSchema.parse({ status: "2" })).toEqual({ status: 2 });
    expect(userStatusSchema.parse({ status: 0 })).toEqual({ status: 0 });
    expect(firstError(proposalStatusSchema, { status: "3" })).toBe("وضعیت پروپوزال صحیح نمی باشد");
    expect(firstError(userStatusSchema, { status: "x" })).toBe("وضعیت کاربر صحیح نمی باشد");
  });
});
