import { useState } from "react";
import { type Key, ListBoxItem } from "react-aria-components";

import { RAComboBox } from "~/components/ui/react-aria/combobox";
import { cn } from "~/lib/utils";

interface Props {
  name: string;
  accounts: {
    id: string;
    code: string;
    accountName: string;
    normalBalance: "CREDIT" | "DEBIT";
    type: {
      id: string;
      name: string;
      category: {
        id: string;
        name: string;
      };
    };
  }[];
  errorMessage?: string;
  defaultValue?: string;
  onSelectionChange?: (key: Key) => void;
  selectedKey?: Key;
  isDisabled?: boolean;
  className?: string;
}

export function AccountComboBox({
  accounts,
  name,
  errorMessage,
  defaultValue,
  onSelectionChange,
  selectedKey,
  isDisabled,
  className,
}: Props) {
  const [typeId, setTypeId] = useState<Key | null>(
    selectedKey || defaultValue || null
  );

  return (
    <>
      <input type="hidden" name={name} value={typeId || ""} />
      <RAComboBox
        label="Account"
        defaultItems={accounts}
        onSelectionChange={(key) => {
          setTypeId(key);
          onSelectionChange?.(key);
        }}
        errorMessage={errorMessage}
        emptyText="No account"
        defaultInputValue={undefined}
        defaultSelectedKey={defaultValue}
        placeholder="Select a account"
        isDisabled={isDisabled}
        className={cn("flex-1", className)}
      >
        {(account) => (
          <ListBoxItem
            className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded flex items-center justify-between gap-2"
            textValue={account.accountName}
          >
            <span>{account.accountName}</span>
            <span className="text-muted-foreground">
              {account.type.category.name}
            </span>
          </ListBoxItem>
        )}
      </RAComboBox>
    </>
  );
}
