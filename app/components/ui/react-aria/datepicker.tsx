import type { DatePickerProps, DateValue } from "react-aria-components";
import {
  Text,
  Dialog,
  Label,
  Button,
  Popover,
  DatePicker,
  Group,
  DateInput,
  DateSegment,
  Calendar,
  Heading,
  CalendarGrid,
  CalendarCell,
} from "react-aria-components";
import { labelVariants } from "../label";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface RADatePickerProps<T extends DateValue> extends DatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string;
  optional?: boolean;
}

export function RADatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  optional,
  ...props
}: RADatePickerProps<T>) {
  return (
    <DatePicker {...props}>
      <div className="flex justify-between items-center mb-2">
        <Label className={labelVariants()}>{label}</Label>
        {optional && (
          <span className="text-sm leading-none text-muted-foreground">
            optional
          </span>
        )}
      </div>
      <Group className="flex border rounded-md px-3 py-2 justify-between">
        <DateInput className="flex gap-1 text-sm">
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <Button>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </Group>
      {description && (
        <Text
          slot="description"
          className="text-sm text-muted-foreground font-semibold"
        >
          {description}
        </Text>
      )}
      {errorMessage && (
        <Text
          slot="errorMessage"
          className="text-sm text-red-600 font-semibold"
        >
          {errorMessage}
        </Text>
      )}
      <Popover>
        <Dialog>
          <Calendar className="w-[260px] border rounded-md p-2 bg-background shadow-md dark:shadow-primary/5">
            <header className="flex justify-between items-center mb-2">
              <Button
                className="hover:bg-accent p-1.5 rounded-md"
                slot="previous"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </Button>
              <Heading className="font-semibold" />
              <Button className="hover:bg-accent p-1.5 rounded-md" slot="next">
                <ChevronRightIcon className="w-5 h-5" />
              </Button>
            </header>
            <CalendarGrid className="w-full">
              {(date) => (
                <CalendarCell
                  className={({ isOutsideMonth, isSelected }) =>
                    cn(
                      `mt-1 flex items-center justify-center h-8 rounded-md text-sm font-medium`,
                      isOutsideMonth
                        ? "text-muted-foreground/40 cursor-default"
                        : "hover:bg-accent",
                      isSelected &&
                        "bg-primary hover:bg-primary/70 text-primary-foreground"
                    )
                  }
                  date={date}
                />
              )}
            </CalendarGrid>
            {errorMessage && (
              <Text
                slot="errorMessage"
                className="text-sm text-red-600 font-semibold"
              >
                {errorMessage}
              </Text>
            )}
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  );
}
