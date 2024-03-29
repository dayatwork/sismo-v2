import { useState } from "react";
import { type Key, ListBoxItem } from "react-aria-components";

import { RAComboBox } from "~/components/ui/react-aria/combobox";

interface Props {
  name: string;
  roles: {
    id: string;
    name: string;
  }[];
  errorMessage?: string;
  defaultValue?: string;
}

export function RoleComboBox({
  roles,
  name,
  errorMessage,
  defaultValue,
}: Props) {
  const [roleId, setRoleId] = useState<Key | null>();

  return (
    <>
      <input type="hidden" name={name} value={roleId || ""} />
      <RAComboBox
        label="Role"
        defaultItems={roles}
        onSelectionChange={setRoleId}
        errorMessage={errorMessage}
        emptyText="No roles"
        defaultInputValue={undefined}
        defaultSelectedKey={defaultValue}
        placeholder="Select a role"
      >
        {(role) => (
          <ListBoxItem
            className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded flex items-center gap-2"
            textValue={role.name}
          >
            {role.name}
          </ListBoxItem>
        )}
      </RAComboBox>
    </>
  );
}
