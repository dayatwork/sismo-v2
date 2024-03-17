import { ChevronsUpDown } from "lucide-react";
import {
  type ComboBoxProps,
  type ListBoxItemProps,
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  Popover,
  Text,
  FieldError,
  ListBoxItem,
  Group,
} from "react-aria-components";

interface RAComboBoxProps<T extends object>
  extends Omit<ComboBoxProps<T>, "children"> {
  label?: string;
  description?: string | null;
  placeholder?: string;
  errorMessage?: string;
  emptyText?: string;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function RAComboBox<T extends object>({
  label,
  description,
  errorMessage,
  children,
  emptyText,
  placeholder,
  ...props
}: RAComboBoxProps<T>) {
  return (
    <ComboBox {...props}>
      <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </Label>
      <Group className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent py-1 pr-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        <Input
          className="flex-1 w-full px-3 border-none bg-transparent outline-none"
          placeholder={placeholder}
        />
        <Button className="px-2 rounded pressed:bg-neutral-500">
          <ChevronsUpDown className="w-4 h-4" />
        </Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="mt-1 max-h-60 w-[--trigger-width] overflow-auto rounded bg-background shadow-lg ring-1 ring-border entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
        <ListBox
          className="outline-none p-1 space-y-0.5"
          renderEmptyState={({ isEmpty }) => (
            <span
              className={isEmpty ? "items-center justify-center italic" : ""}
            >
              {emptyText || "No result found"}
            </span>
          )}
        >
          {children}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

export function RAComboBoxItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded"
    />
  );
}
