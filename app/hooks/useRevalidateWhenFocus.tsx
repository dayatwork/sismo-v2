import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";

export function useRevalidateWhenFocus() {
  const revalidator = useRevalidator();

  useEffect(() => {
    const onFocus = () => {
      revalidator.revalidate();
    };

    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, [revalidator]);
}
