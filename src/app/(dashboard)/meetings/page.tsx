import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { auth } from "@/lib/auth";
import MeetingsView, {
  MeetingsViewErrorState,
  MeetingsViewLoading,
} from "@/modules/meetings/views/meetings-view";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const MeetingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}));

  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<MeetingsViewLoading />}>
          <ErrorBoundary fallback={<MeetingsViewErrorState />}>
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default MeetingsPage;
