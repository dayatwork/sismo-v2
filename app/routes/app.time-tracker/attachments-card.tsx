import { useNavigate } from "@remix-run/react";
import { FileIcon, FilesIcon, LinkIcon, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Separator } from "~/components/ui/separator";

interface Props {
  timeTrackerId: string;
  attachments: {
    id: string;
    url: string;
    displayName: string;
    type: "FILE" | "DOCUMENT" | "LINK";
  }[];
  appUrl: string;
}

export function AttachmentsCard({ attachments, timeTrackerId, appUrl }: Props) {
  const navigate = useNavigate();
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="outline"
          className={attachments.length === 0 ? "border-dashed" : ""}
        >
          {attachments.length}{" "}
          {attachments.length === 1 ? "attachment" : "attachments"}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="p-4">
        <h3>Attachments</h3>
        <Separator className="my-2" />
        {attachments.length === 0 && (
          <p className="text-center py-6 text-muted-foreground text-sm">
            No attachments
          </p>
        )}
        <ul className="space-y-1">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="py-1 flex gap-2">
              <div className="flex-1 font-semibold text-sm flex gap-2 items-center hover:underline ">
                {attachment.type === "DOCUMENT" ? (
                  <FilesIcon className="mr-2 w-4 h-4" />
                ) : attachment.type === "FILE" ? (
                  <FileIcon className="mr-2 w-4 h-4" />
                ) : (
                  <LinkIcon className="mr-2 w-4 h-4" />
                )}

                <a
                  href={
                    attachment.type === "DOCUMENT"
                      ? `${appUrl}/${attachment.url}`
                      : attachment.url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  {attachment.displayName}
                </a>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="text-red-600 w-7 h-7 p-0"
                onClick={() =>
                  navigate(
                    `${timeTrackerId}/attachments/${attachment.id}/delete`
                  )
                }
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
