import React from "react";
import { Button, Input, Label, SearchField } from "react-aria-components";
import { cn } from "~/lib/utils";
import { inputClassName } from "./ui/input";
import { XIcon } from "lucide-react";

interface Props {
  onSearch: (searchValue: string) => void;
  onClear: () => void;
  defaultValue?: string;
  placeholder?: string;
}

export function SearchInput({
  onSearch,
  onClear,
  defaultValue,
  placeholder,
}: Props) {
  return (
    <SearchField
      className="relative max-w-[300px] w-full"
      onClear={onClear}
      defaultValue={defaultValue}
      onKeyDown={(e) => {
        if (e.code === "Enter") {
          onSearch(e.currentTarget.value);
        }
      }}
    >
      {({ isEmpty }) => (
        <>
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Input
            className={cn(inputClassName, "pr-10 bg-background")}
            placeholder={placeholder}
          />
          {!isEmpty ? (
            <Button className="absolute top-2 right-2 p-1 rounded hover:bg-accent">
              <XIcon className="w-4 h-4" />
            </Button>
          ) : null}
        </>
      )}
    </SearchField>
  );
}
