import type {
  DateRangePickerProps,
  DateValue,
  ValidationResult,
} from "react-aria-components";
import {
  Button,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateRangePicker,
  DateSegment,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
  RangeCalendar,
  Text,
} from "react-aria-components";
import { labelVariants } from "../label";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface MyDateRangePickerProps<T extends DateValue>
  extends DateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  optional?: boolean;
}

export function RADateRangePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  optional,
  ...props
}: MyDateRangePickerProps<T>) {
  return (
    <DateRangePicker {...props}>
      <div className="flex justify-between items-center mb-2">
        <Label className={labelVariants()}>{label}</Label>
        {optional && (
          <span className="text-sm leading-none text-muted-foreground">
            optional
          </span>
        )}
      </div>
      <Group className="flex items-center border rounded-md px-3 py-2 gap-4">
        <DateInput slot="start" className="flex gap-1 text-sm">
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <span aria-hidden="true">–</span>
        <DateInput slot="end" className="flex gap-1 text-sm">
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <Button className="ml-auto">
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
      <FieldError className="text-sm text-red-600 font-semibold">
        {errorMessage}
      </FieldError>
      <Popover>
        <Dialog>
          <RangeCalendar className="w-[260px] border rounded-md p-2 bg-background shadow-md dark:shadow-primary/5">
            <header className="flex justify-between items-center mb-2">
              <Button
                slot="previous"
                className="hover:bg-accent p-1.5 rounded-md"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </Button>
              <Heading className="font-semibold" />
              <Button slot="next" className="hover:bg-accent p-1.5 rounded-md">
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
          </RangeCalendar>
        </Dialog>
      </Popover>
    </DateRangePicker>
  );
}
