import { useState } from "react";
import { type Key, ListBoxItem } from "react-aria-components";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { RAComboBox } from "~/components/ui/react-aria/combobox";

interface Props {
  name: string;
  users: {
    id: string;
    name: string;
    photo: string | null;
  }[];
  errorMessage?: string;
  defaultValue?: string;
  disabledKeys?: string[];
  hideLabel?: boolean;
  handleSearchParam?: (userId: string) => void;
}

export function UserComboBox({
  users,
  name,
  errorMessage,
  defaultValue,
  disabledKeys,
  hideLabel,
  handleSearchParam,
}: Props) {
  const [userId, setUserId] = useState<Key | null>();

  return (
    <>
      <input type="hidden" name={name} value={userId || ""} />
      <RAComboBox
        label={hideLabel ? undefined : "User"}
        defaultItems={users}
        onSelectionChange={(key) => {
          setUserId(key);
          if (key) {
            handleSearchParam?.(key.toString());
          }
        }}
        errorMessage={errorMessage}
        emptyText="No user"
        defaultInputValue={undefined}
        defaultSelectedKey={defaultValue}
        placeholder="Select a user"
        disabledKeys={disabledKeys}
      >
        {(user) => (
          <ListBoxItem
            className="py-1.5 px-2 text-sm focus:bg-accent focus:text-accent-foreground selected:bg-accent selected:text-accent-foreground rounded flex items-center gap-2 disabled:text-muted-foreground/50 disabled:cursor-not-allowed"
            textValue={user.name}
          >
            {/* <img
              src={users?.photo || ""}
              alt=""
              className="w-6 h-6 rounded-full"
            /> */}
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.photo || ""} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <span className="truncate">{user.name}</span>
            {disabledKeys?.includes(user.id) && (
              <span className="ml-auto text-muted-foreground/50 text-sm">
                Already a member
              </span>
            )}
          </ListBoxItem>
        )}
      </RAComboBox>
    </>
  );
}
