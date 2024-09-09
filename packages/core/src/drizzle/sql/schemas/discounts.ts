import { relations } from "drizzle-orm";
import { integer, json, text } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { company_discounts } from "./company_discounts";
import { commonTable } from "./entity";
import { organization_discounts } from "./organization_discounts";

// Discount type definitions
type PercentageDeal = {
  type: "percentage";
  percentageValue: number; // E.g., 10% off
};

type FixedAmountDeal = {
  type: "fixed_amount";
  amountValue: number; // E.g., $20 off
};

type BundleDeal = {
  type: "bundle";
  buyQuantity: number; // E.g., Buy 1
  getQuantity: number; // E.g., Get 1 Free
  discountOnItemN: number; // E.g., 50% off on 2nd item
};

type VolumeDeal = {
  type: "volume";
  volumeThreshold: number; // E.g., Buy 10+
  discountValue: number; // E.g., 15% off
};

export type DealData = PercentageDeal | FixedAmountDeal | BundleDeal | VolumeDeal;

export const discounts = commonTable(
  "discounts",
  {
    name: text("name").notNull(),
    description: text("description"),
    data: json("data").$type<DealData>(),
    startDate: text("start_date"),
    endDate: text("end_date"),
  },
  "deal",
);

export type DealSelect = typeof discounts.$inferSelect;
export type DealInsert = typeof discounts.$inferInsert;

export const deal_relation = relations(discounts, ({ many }) => ({
  companies: many(company_discounts),
  organizations: many(organization_discounts),
}));
