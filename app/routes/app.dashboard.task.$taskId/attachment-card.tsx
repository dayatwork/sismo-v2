import { FileIcon, FilesIcon, LinkIcon, PaperclipIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Separator } from "~/components/ui/separator";

interface Props {
  attachments: {
    id: string;
    url: string;
    displayName: string;
    type: "FILE" | "DOCUMENT" | "LINK";
  }[];
  appUrl: string;
}

export function AttachmentsCard({ attachments, appUrl }: Props) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className={attachments.length === 0 ? "border-dashed" : ""}
        >
          <span className="sr-only">Attachments</span>
          <PaperclipIcon className="w-4 h-4" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-36 p-0" align="end">
        <h3 className="py-2 px-3 text-sm font-semibold">Attachments</h3>
        <Separator />
        {attachments.length === 0 && (
          <p className="text-center py-6 text-muted-foreground text-sm">
            No attachments
          </p>
        )}
        <ul className="space-y-1">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex gap-2">
              <div className="flex-1 font-semibold text-sm flex items-center hover:bg-accent py-2 px-3">
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
                  className="flex-1 truncate w-20"
                >
                  {attachment.displayName}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
