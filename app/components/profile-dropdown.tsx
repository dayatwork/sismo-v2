import { Link } from "@remix-run/react";

import { LogOutIcon, UserIcon, ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface Props {
  name: string;
  photo?: string | null;
}

export default function ProfileDropdown({ name, photo }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="-m-1.5 flex items-center p-1.5 hover:bg-accent rounded-lg">
        <img
          className="h-9 w-9 rounded-full bg-gray-50 object-cover"
          src={photo || `https://ui-avatars.com/api/?name=${name}`}
          alt=""
        />
        <span className="hidden lg:flex lg:items-center">
          <span
            className="ml-4 text-sm font-semibold leading-6 text-foreground w-24 text-left truncate"
            aria-hidden="true"
          >
            {name}
          </span>
          <ChevronDownIcon
            className="ml-2 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link to="/your-profile" className="flex cursor-pointer">
            <UserIcon className="w-4 h-4 mr-2" />
            Your Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <form action="/logout" method="post" className="w-full">
            <button type="submit" className="flex w-full">
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
