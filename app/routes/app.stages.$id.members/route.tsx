import { Outlet, useNavigate, useOutletContext } from "@remix-run/react";
import dayjs from "dayjs";
import { CrownIcon, PlusIcon, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

type Context = {
  stage: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
    status: string;
    members: {
      id: string;
      joinDate: string;
      role: "PIC" | "MEMBER";
      user: {
        id: string;
        name: string;
        photo: string | null;
      };
    }[];
  };
};

export default function StageMembers() {
  const { stage } = useOutletContext<Context>();
  const navigate = useNavigate();

  return (
    <>
      <Outlet />
      <div className="-mt-px border rounded-b-md rounded-tr-md bg-neutral-50 dark:bg-neutral-900">
        <div className="py-2 px-6 flex justify-between items-center">
          <h2 className="font-semibold text-primary">Members</h2>
          <Button size="sm" variant="outline" onClick={() => navigate("add")}>
            <PlusIcon className="mr-2 w-4 h-4" />
            New member
          </Button>
        </div>
        <Separator />
        {stage.members.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-4 py-10">
            <p className="text-muted-foreground">No members</p>
            <Button size="sm" variant="outline" onClick={() => navigate("add")}>
              <PlusIcon className="mr-2 w-4 h-4" />
              New member
            </Button>
          </div>
        ) : (
          <ul className="text-sm">
            {stage.members.map((member) => (
              <li
                key={member.id}
                className="flex gap-10 items-center group hover:bg-accent px-6 py-2"
              >
                <div className="flex gap-4 items-center w-80">
                  <Avatar>
                    <AvatarImage
                      src={member.user.photo || ""}
                      className="object-cover"
                    />
                    <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">{member.user.name}</p>
                  {member.role === "PIC" && (
                    <Badge className="uppercase">PIC</Badge>
                  )}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-muted-foreground">
                    Joined on {dayjs(member.joinDate).format("MMM D, YYYY")}
                  </p>
                  <div className="flex gap-2">
                    {member.role === "MEMBER" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${member.id}/set-pic`)}
                        className="opacity-0 group-hover:opacity-100 group-hover:border-neutral-400 dark:hover:bg-neutral-900 hover:bg-white"
                      >
                        <CrownIcon className="mr-2 w-4 h-4" />
                        Set as PIC
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-600 hover:text-red-600 dark:hover:bg-neutral-900 hover:bg-white opacity-0 group-hover:opacity-100"
                      onClick={() => navigate(`${member.id}/remove`)}
                    >
                      <Trash2 className="mr-2 w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
