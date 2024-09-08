import { schema } from "./utils";

export const org_role = schema.enum("org_roles", ["owner", "employee"]);

export const comp_role = schema.enum("comp_role", ["owner", "employee"]);

export const user_role = schema.enum("user_roles", ["admin", "member"]);

export type OrgRole = typeof org_role.enumValues;

export type UserRole = typeof user_role.enumValues;
