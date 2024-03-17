import { ScrollArea } from "../ui/scroll-area";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "~/lib/utils";

interface Props {
  users: {
    id: string;
    name: string;
    photo: string | null;
  }[];
  onSelect: (userId: string) => void;
  selectedUser: string | null;
}

export function UserList({ users, onSelect, selectedUser }: Props) {
  return (
    <ScrollArea className="max-h-[600px] w-[220px] border rounded-md">
      <div className="space-y-2 p-2">
        {users.map((user) => (
          <button
            key={user.id}
            className={cn(
              "flex gap-2 items-center w-full hover:bg-accent p-2 rounded",
              selectedUser === user.id && "bg-white/10"
            )}
            onClick={() => onSelect(user.id)}
          >
            {/* <Avatar className="w-9 h-9 rounded">
              <AvatarImage
                src={
                  user.photo || `https://ui-avatars.com/api/?name=${user.name}`
                }
                className="object-cover"
              />
              <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
            </Avatar> */}
            <span className="font-semibold text-sm line-clamp-1 text-left">
              {user.name}
            </span>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
