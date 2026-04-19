import { twMerge } from "tailwind-merge";

export const cn = (...values: Array<string | false | null | undefined>): string =>
  twMerge(values.filter(Boolean).join(" "));
