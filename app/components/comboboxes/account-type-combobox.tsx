import { useState } from "react";
import { type Key, ListBoxItem } from "react-aria-components";

import { RAComboBox } from "~/components/ui/react-aria/combobox";

interface Props {
  name: string;
  types: {
    id: string;
    name: string;
    category: string;
  }[];
  errorMessage?: string;
  defaultValue?: string;
  onSelectionChange?: (key: Key) => void;
  selectedKey?: Key;
  isDisabled?: boolean;
}

export function AccountTypeComboBox({
  types,
  name,
  errorMessage,
  defaultValue,
  onSelectionChange,
  selectedKey,
  isDisabled,
}: Props) {
  const [typeId, setTypeId] = useState<Key | null>(
    selectedKey || defaultValue || null
  );

  return (
    <>
      <input type="hidden" name={name} value={typeId || ""} />
      <RAComboBox
        label="Account Type"
        defaultItems={types}
        onSelectionChange={(key) => {
          setTypeId(key);
          onSelectionChange?.(key);
        }}
        errorMessage={errorMessage}
        emptyText="No type"
        defaultInputValue={undefined}
        defaultSelectedKey={defaultValue}
        placeholder="Select a type"
        isDisabled={isDisabled}
      >
        {(type) => (
          <ListBoxItem
            className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded flex items-center justify-between gap-2"
            textValue={type.name}
          >
            <span>{type.name}</span>
            <span className="text-muted-foreground">{type.category}</span>
          </ListBoxItem>
        )}
      </RAComboBox>
    </>
  );
}
