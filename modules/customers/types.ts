import type { AppRouter, RouterOutput } from "@/trpc/routers/_app";
import type { inferRouterInputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;

export type CustomersInput = RouterInput["customers"]["list"];
export type CustomersOutput = RouterOutput["customers"]["list"];
export type CustomerOutput = CustomersOutput["data"][number];
export type CustomerInput = RouterInput["customers"]["get"];
