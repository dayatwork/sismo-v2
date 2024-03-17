import { Link, useFetcher, useResolvedPath } from "@remix-run/react";
import { Bell, BellIcon, Mail } from "lucide-react";
import { useEffect } from "react";
import { useEventSource } from "remix-utils/sse/react";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { type NotificationLoader } from "../notifications";
import { Button } from "~/components/ui/button";

// interface Notification {
//   id: string;
//   title: string;
//   description: string | null;
//   isBroadcast: boolean;
//   receiverId: string | null;
//   read: boolean;
//   type: string | null;
//   thumbnail: string | null;
//   link: string;
//   createdAt: string;
// }

export default function NotificationButton() {
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const path = useResolvedPath("/notifications/stream");
  const data = useEventSource(path.pathname, { event: "notifications" });

  const fetcher = useFetcher<NotificationLoader>();
  const load = fetcher.load;

  useEffect(() => {
    load("/notifications");
  }, [load]);

  useEffect(() => {
    load("/notifications");
    if (data) {
      toast("New notification", {
        position: "bottom-right",
        icon: <Bell className="w-5 h-5" />,
      });
      let sound = document.getElementById(
        "notification-sound"
      ) as HTMLAudioElement | null;
      if (sound) {
        sound.play();
      } else {
        sound = new Audio("/light.mp3");
        sound.setAttribute("id", "notification-sound");
        document.body.appendChild(sound);
        sound.play();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleReadAll = async () => {
    fetcher.submit(
      { action: "read-all" },
      { action: "/notifications", method: "POST" }
    );
    // fetcher.load("/notifications");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          type="button"
          className="relative"
          variant="outline"
        >
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-5 w-5" aria-hidden="true" />
          {fetcher.data?.notifications?.length ? (
            <>
              <span className="w-2.5 h-2.5 absolute -top-1 -right-1 rounded-full bg-green-600 animate-ping"></span>
              <span className="w-2.5 h-2.5 absolute -top-1 -right-1 rounded-full bg-green-600 animate-pulse"></span>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="shadow-2xl dark:shadow-neutral-800 w-[340px]">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Notifications</h2>
          {fetcher.data?.notifications?.length ? (
            <button
              className="text-sm text-muted-foreground hover:underline"
              onClick={handleReadAll}
            >
              Mark all as read
            </button>
          ) : null}
        </div>
        <Separator className="mt-3 mb-1" />
        {fetcher.data?.notifications?.length ? (
          <ul className="space-y-1">
            {fetcher.data.notifications.map((notification) => (
              <li key={notification.id}>
                <Link
                  to={notification.link}
                  className="flex gap-4 items-start hover:bg-accent p-2 rounded"
                >
                  <Mail className="w-7 h-7 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        {notification.title}
                      </h3>
                      <time className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </time>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {notification.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-sm text-muted-foreground text-center">
            No notifications
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
