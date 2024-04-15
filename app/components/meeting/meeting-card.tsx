"use client";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import toast from "react-hot-toast";

const avatarImages = [
  "https://i.pravatar.cc/300?img=1",
  "https://i.pravatar.cc/300?img=2",
  "https://i.pravatar.cc/300?img=3",
  "https://i.pravatar.cc/300?img=4",
];

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  isRecording?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  isRecording,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  return (
    <section className="flex min-h-[230px] w-full flex-col justify-between rounded-[14px] px-5 py-8 border">
      <article className="flex flex-col gap-5 mb-3">
        <img src={icon} alt="upcoming" width={24} height={24} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground font-normal">
              {new Date(date).toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "long",
              })}
            </p>
          </div>
        </div>
      </article>
      <article className={cn("flex justify-center relative", {})}>
        <div className="relative flex w-full max-sm:hidden">
          {avatarImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="attendees"
              width={40}
              height={40}
              className={cn("rounded-full", { absolute: index > 0 })}
              style={{ top: 0, left: index * 28 }}
            />
          ))}
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} variant="outline">
              {buttonIcon1 && (
                <img src={buttonIcon1} alt="feature" width={16} height={16} />
              )}
              &nbsp; {buttonText}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast("link copied!");
              }}
              variant="outline"
            >
              <img src="/icons/copy.svg" alt="feature" width={20} height={20} />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
