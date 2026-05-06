import { describe, it, expectTypeOf, expect } from "vitest";
import type { Database, Json } from "@/integrations/supabase/types";

type Row = Database["public"]["Tables"]["remodel_designs"]["Row"];
type Insert = Database["public"]["Tables"]["remodel_designs"]["Insert"];
type Update = Database["public"]["Tables"]["remodel_designs"]["Update"];

describe("Pass 16 — remodel_designs schema sanity", () => {
  it("Row has legacy_project_id: string | null", () => {
    expectTypeOf<Row["legacy_project_id"]>().toEqualTypeOf<string | null>();
  });

  it("Row has legacy_extras: Json | null", () => {
    expectTypeOf<Row["legacy_extras"]>().toEqualTypeOf<Json | null>();
  });

  it("Insert allows omitting or nulling legacy fields", () => {
    const a: Insert = { user_id: "u" };
    const b: Insert = { user_id: "u", legacy_project_id: null, legacy_extras: null };
    const c: Insert = { user_id: "u", legacy_project_id: "p", legacy_extras: { foo: "bar" } };
    expect([a, b, c]).toHaveLength(3);
  });

  it("Update allows omitting or nulling legacy fields", () => {
    const a: Update = {};
    const b: Update = { legacy_project_id: null, legacy_extras: null };
    const c: Update = { legacy_project_id: "p", legacy_extras: { dimensions: { length: 8 } } };
    expect([a, b, c]).toHaveLength(3);
  });
});
