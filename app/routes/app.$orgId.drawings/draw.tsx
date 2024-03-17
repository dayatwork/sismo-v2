import { lazy } from "react";
import "@tldraw/tldraw/tldraw.css";
import { ClientOnly } from "remix-utils/client-only";

let LazyImported = lazy(() =>
  import("@tldraw/tldraw").then((module) => ({ default: module.Tldraw }))
);

export default function Draw() {
  return (
    <ClientOnly>
      {() => <LazyImported persistenceKey="tldraw" className="z-0" />}
    </ClientOnly>
  );
}
