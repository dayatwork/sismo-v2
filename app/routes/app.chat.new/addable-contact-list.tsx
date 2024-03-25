import { useState } from "react";
import {
  GridList,
  GridListItem,
  Text,
  type Selection,
} from "react-aria-components";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
// import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
// import { RAComboBox } from "~/components/ui/react-aria/combobox";

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
      {/* <ListBox
        aria-label="Contacts"
        className="w-72 max-h-[290px] overflow-auto outline-none bg-white text-neutral-700 p-2 flex flex-col gap-2 rounded-lg shadow scroll-pt-6"
        items={contacts}
      >
        {(contact) => <Contact item={contact} />}
      </ListBox> */}
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
              <AvatarImage src={contact.photo || ""} alt="" />
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

// type Item = {
//   id: string;
//   name: string;
//   photo: string | null;
// };

// function Contact({ item }: { item: Item }) {
//   return (
//     <ListBoxItem
//       id={item.id}
//       textValue={item.name}
//       className="group relative py-1 px-2 outline-none cursor-default grid grid-rows-2 grid-flow-col auto-cols-max gap-x-3 rounded selected:bg-accent text-neutral-700 selected:text-white selected:[&:has(+[data-selected])]:rounded-b-none [&[data-selected]+[data-selected]]:rounded-t-none focus-visible:ring-2 ring-offset-2 ring-ring"
//     >
//       <img
//         src={item.photo || ""}
//         alt=""
//         className="row-span-2 place-self-center h-8 w-8 rounded-full"
//       />
//       <Text slot="label" className="font-semibold truncate">
//         {item.name}
//       </Text>
//       {/* <Text
//         slot="description"
//         className="truncate text-sm text-neutral-600 group-selected:text-white"
//       >
//         {item.username}
//       </Text> */}
//       <div className="absolute left-12 right-2 bottom-0 h-px bg-gray-200 group-selected:bg-accent [.group[data-selected]:has(+:not([data-selected]))_&]:hidden [.group:not([data-selected]):has(+[data-selected])_&]:hidden [.group[data-selected]:last-child_&]:hidden" />
//     </ListBoxItem>
//   );
// }
