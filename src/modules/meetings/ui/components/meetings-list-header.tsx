"use client";

import { PlusIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE } from "@/constants";
import { NewMeetingDilaog } from "./new-meeting-dialog";
import { useState } from "react";

export const MeetingsListHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <NewMeetingDilaog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <div className="p-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-xl">My Meetings</h5>
          <Button
            onClick={() => {
              setIsDialogOpen(true);
            }}
          >
            <PlusIcon />
            New Meeting
          </Button>
        </div>
        <div className="flex items-center gap-x-2 p-1">Todo:filters</div>
      </div>
    </>
  );
};
