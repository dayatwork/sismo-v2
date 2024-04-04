import { useState } from "react";
import { type Key, ListBoxItem } from "react-aria-components";

import { RAComboBox } from "~/components/ui/react-aria/combobox";

interface Props {
  name: string;
  deduction: {
    id: string;
    name: string;
  }[];
  errorMessage?: string;
  defaultValue?: string;
}

export function DeductionComboBox({
  deduction,
  name,
  errorMessage,
  defaultValue,
}: Props) {
  const [deductionId, setDeductionId] = useState<Key | null>();

  return (
    <>
      <input type="hidden" name={name} value={deductionId || ""} />
      <RAComboBox
        label="Deduction"
        defaultItems={deduction}
        onSelectionChange={setDeductionId}
        errorMessage={errorMessage}
        emptyText="No items"
        defaultInputValue={undefined}
        defaultSelectedKey={defaultValue}
        placeholder="Select an item"
      >
        {(wage) => (
          <ListBoxItem
            className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded flex items-center gap-2"
            textValue={wage.name}
          >
            {wage.name}
          </ListBoxItem>
        )}
      </RAComboBox>
    </>
  );
}
