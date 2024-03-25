import { PanelLeft } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import AppNavigation from "./app-navigation";
import AppLogo from "~/components/app-logo";

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="border hover:bg-accent rounded p-2">
          <PanelLeft className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] py-0 overflow-auto">
        <AppLogo />
        <AppNavigation />
      </SheetContent>
    </Sheet>
  );
}
