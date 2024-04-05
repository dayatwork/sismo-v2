import { useState } from "react";
import { type Key, ListBoxItem } from "react-aria-components";

import { RAComboBox } from "~/components/ui/react-aria/combobox";

interface Props {
  name: string;
  months: {
    id: string;
    name: string;
  }[];
  errorMessage?: string;
  defaultValue?: string;
}

export function MonthComboBox({
  months,
  name,
  errorMessage,
  defaultValue,
}: Props) {
  const [monthId, setMonthId] = useState<Key | null>(defaultValue || null);

  return (
    <>
      <input type="hidden" name={name} value={monthId || ""} />
      <RAComboBox
        label="Month"
        defaultItems={months}
        onSelectionChange={setMonthId}
        errorMessage={errorMessage}
        emptyText="No months"
        defaultInputValue={undefined}
        defaultSelectedKey={defaultValue}
        placeholder="Select a month"
      >
        {(month) => (
          <ListBoxItem
            className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded flex items-center gap-2"
            textValue={month.name}
          >
            {month.name}
          </ListBoxItem>
        )}
      </RAComboBox>
    </>
  );
}
