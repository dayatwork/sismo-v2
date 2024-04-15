import { useState } from "react";
import {
  GridList,
  GridListItem,
  Text,
  type Selection,
} from "react-aria-components";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface Props {
  name: string;
  multiple?: boolean;
  contacts: {
    id: string;
    name: string;
    photo: string | null;
  }[];
  emptyText?: string;
}

export function AddableContactList({
  contacts,
  name,
  multiple = false,
  emptyText = "No items",
}: Props) {
  const [userId, setUserId] = useState<Selection>(new Set([]));

  const selected = Object.values(
    Object.fromEntries(new Set(userId).entries())
  ) as string[];

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={multiple ? selected : selected[0] || ""}
      />
      <GridList
        items={contacts}
        aria-label="contacts"
        selectionBehavior="replace"
        selectionMode={multiple ? "multiple" : "single"}
        className="space-y-2 p-2 rounded-md border bg-background"
        selectedKeys={userId}
        onSelectionChange={setUserId}
        renderEmptyState={() => emptyText}
      >
        {(contact) => (
          <GridListItem
            id={contact.id}
            textValue={contact.name}
            className="flex items-center gap-2 selected:bg-green-300 dark:selected:bg-green-800 rounded p-1 cursor-pointer hover:bg-accent"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={contact.photo || ""}
                alt=""
                className="object-cover"
              />
              <AvatarFallback>{contact.name[0]}</AvatarFallback>
            </Avatar>
            <Text slot="description" className="font-semibold text-sm truncate">
              {contact.name}
            </Text>
          </GridListItem>
        )}
      </GridList>
    </>
  );
}
