"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../ui/components/columns";
import { EmptyState } from "@/components/empty-state";

const MeetingsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable
      data={data.items}
      columns={columns}
      emptyStateComponent={
        <EmptyState
        title="Create your first meeting"
        description="Start a meeting to collaborate with agents and participants. Meetings enable seamless real-time discussions and teamwork."
        />
      }
      />
    </div>
  );
};
export default MeetingsView;

export const MeetingsViewLoading = () => (
  <LoadingState
    title="Loading Meetings"
    description="This may take a few seconds"
  />
);

export const MeetingsViewErrorState = () => (
  <ErrorState
    title="Error Loading Meetings"
    description="Please try again later"
  />
);
