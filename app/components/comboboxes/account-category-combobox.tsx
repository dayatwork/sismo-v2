import { useState } from "react";
import { type Key, ListBoxItem } from "react-aria-components";

import { RAComboBox } from "~/components/ui/react-aria/combobox";

interface Props {
  name: string;
  categories: {
    id: string;
    name: string;
    normalBalance: string;
  }[];
  errorMessage?: string;
  defaultValue?: string;
  onSelectionChange?: (key: Key) => void;
  selectedKey?: Key;
}

export function AccountCategoryComboBox({
  categories,
  name,
  errorMessage,
  defaultValue,
  onSelectionChange,
  selectedKey,
}: Props) {
  const [categoryId, setCategoryId] = useState<Key | null>(selectedKey || null);

  return (
    <>
      <input type="hidden" name={name} value={categoryId || ""} />
      <RAComboBox
        label="Account Category"
        defaultItems={categories}
        onSelectionChange={(key) => {
          setCategoryId(key);
          onSelectionChange?.(key);
        }}
        errorMessage={errorMessage}
        emptyText="No category"
        defaultInputValue={undefined}
        defaultSelectedKey={defaultValue}
        placeholder="Select a category"
      >
        {(category) => (
          <ListBoxItem
            className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded flex items-center justify-between gap-2"
            textValue={category.name}
          >
            <span>{category.name}</span>
            <span className="text-muted-foreground">
              {category.normalBalance}
            </span>
          </ListBoxItem>
        )}
      </RAComboBox>
    </>
  );
}
