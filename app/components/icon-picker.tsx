import EmojiPicker, { Theme } from "emoji-picker-react";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useTheme } from "~/routes/action.set-theme";
import { useState } from "react";

interface IconPickerProps {
  onChange: (icon: string) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const IconPicker = ({
  onChange,
  children,
  asChild,
}: IconPickerProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="p-0 w-full border-none shadow-none">
        <EmojiPicker
          height={350}
          theme={
            theme === "dark"
              ? Theme.DARK
              : theme === "light"
              ? Theme.LIGHT
              : Theme.AUTO
          }
          onEmojiClick={(data) => {
            onChange(data.emoji);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
