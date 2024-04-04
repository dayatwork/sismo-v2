import dayjs from "dayjs";
import { FileIcon, LinkIcon } from "lucide-react";
import {
  FaGoogleDrive,
  FaGithub,
  FaFigma,
  FaGitlab,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { type Attachment } from "~/utils/attachment";

interface Props {
  attachment: Attachment;
  size?: "default" | "small";
}

export function AttachmentCard({ attachment, size = "default" }: Props) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <a
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex flex-col items-center group border rounded-md hover:bg-primary/10 hover:border-primary/30 relative",
            size === "default" ? "p-4" : "p-2"
          )}
        >
          {attachment.type === "FILE" ? (
            <FileIcon className="w-4 h-4 absolute top-1.5 right-1.5 text-primary" />
          ) : (
            <LinkIcon className="w-4 h-4 absolute top-1.5 right-1.5 text-primary" />
          )}
          {attachment.url.includes("docs.google.com") ? (
            <FaGoogleDrive
              className={cn(
                "text-muted-foreground group-hover:text-primary",
                size === "default" ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          ) : attachment.url.includes("github.com") ? (
            <FaGithub
              className={cn(
                "text-muted-foreground group-hover:text-primary",
                size === "default" ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          ) : attachment.url.includes("gitlab.com") ? (
            <FaGitlab
              className={cn(
                "text-muted-foreground group-hover:text-primary",
                size === "default" ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          ) : attachment.url.includes("figma.com") ? (
            <FaFigma
              className={cn(
                "text-muted-foreground group-hover:text-primary",
                size === "default" ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          ) : attachment.url.includes("youtube.com") ? (
            <FaYoutube
              className={cn(
                "text-muted-foreground group-hover:text-primary",
                size === "default" ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          ) : attachment.url.includes("instagram.com") ? (
            <FaInstagram
              className={cn(
                "text-muted-foreground group-hover:text-primary",
                size === "default" ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          ) : (
            <FileIcon
              className={cn(
                "text-muted-foreground group-hover:text-primary",
                size === "default" ? "w-10 h-10" : "w-8 h-8"
              )}
            />
          )}
          <div className="mt-4 space-y-2">
            <span
              className={cn(
                "block leading-none text-center font-semibold group-hover:text-primary truncate",
                size === "default" ? "text-base w-28" : "text-sm w-24"
              )}
            >
              {attachment.displayName}
            </span>
            <div className="space-y-1">
              <span
                className={cn(
                  "block leading-none text-center text-muted-foreground group-hover:text-primary truncate",
                  size === "default" ? "text-sm w-28" : "text-xs w-24"
                )}
              >
                {attachment.user.name}
              </span>
              <span
                className={cn(
                  "block leading-none text-center text-muted-foreground group-hover:text-primary truncate text-sm",
                  size === "default" ? "text-sm w-28" : "text-xs w-24"
                )}
              >
                {dayjs(new Date()).format("YYYY-MM-DD")}
              </span>
            </div>
          </div>
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Attachment</h3>
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="hover:bg-accent p-2 rounded"
          >
            <LinkIcon className="w-4 h-4" />
          </a>
        </div>
        <Separator className="my-3" />
        <dl className="space-y-4">
          <div>
            <dt className="text-muted-foreground text-sm font-semibold">
              Display Name
            </dt>
            <dd>
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {attachment.displayName}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-semibold">
              Owner
            </dt>
            <dd>{attachment.user.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm font-semibold">
              Created At
            </dt>
            <dd>
              {dayjs(new Date(attachment.createdAt)).format(
                "MMM D, YYYY HH:mm"
              )}
            </dd>
          </div>
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}
