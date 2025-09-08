import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoIcon, BanIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

interface Props {
  meetingId: string;
  onCancelMeeting: () => void;
  isCanceling: boolean;
}

export const UpcomingState = ({
  meetingId,
  onCancelMeeting,
  isCanceling,
}: Props) => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/upcoming.svg"
        title="Not started yet"
        description="Once you start this meeting, a summary will appear here"
      />
      <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2">
        <Button
          variant="secondary"
          onClick={onCancelMeeting}
          disabled={isCanceling}
          className="w-full lg:w-auto"
        >
          <BanIcon />
          Cancel meeting
        </Button>
        <Button asChild className="w-full lg:w-auto" disabled={isCanceling}>
          <Link href={`/call/${meetingId}`}>
            <VideoIcon />
            Start meeting
          </Link>
        </Button>
      </div>
    </div>
  );
};
