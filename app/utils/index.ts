import { type SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import { type loader as rootLoader } from "~/root";

export function useRequestInfo() {
  const data = useRouteLoaderData("root") as SerializeFrom<typeof rootLoader>;
  return data.requestInfo;
}

export function useHints() {
  const requestInfo = useRequestInfo();
  return requestInfo.hints;
}

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
  SYSTEM = "system",
}

export const themes: Array<Theme> = Object.values(Theme);

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && themes.includes(value as Theme);
}
