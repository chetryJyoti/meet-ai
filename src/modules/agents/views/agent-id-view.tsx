"use client";
import { VideoIcon } from "lucide-react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { AgentIdViewHeader } from "../ui/components/agent-id-view-header";
import { Badge } from "@/components/ui/badge";

interface Props {
  agentId: string;
}

export const AgentIdView = ({ agentId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );
        // TODO: Invalidate free tier usage
        router.push("/agents");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  return (
    <div className="flex-1 p-4 md:px-8 flex flex-col gap-y-4">
      <AgentIdViewHeader
        agentId={agentId}
        agentName={data.name}
        onEdit={() => {}}
        onRemove={() => {
          removeAgent.mutate({ id: agentId });
        }}
      />
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
          <div className="flex items-center gap-x-3">
            <GeneratedAvatar
              variant="bottsNeutral"
              seed={data.name}
              className="size-10"
            />
            <h2 className="text-2xl font-medium">{data.name}</h2>
          </div>
          <Badge
            variant={"outline"}
            className="flex items-center gap-x-2 [&>svg]:size-4"
          >
            <VideoIcon className="text-blue-700" />
            {data.meetingCount}{" "}
            {data.meetingCount === 1 ? "meeting" : "meetings"}
          </Badge>
          <div className="flex flex-col gap-y-4">
            <p className="text-lg font-medium">Instructions</p>
            <p className="text-neutral-800">{data.instructions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgentsIdViewLoading = () => (
  <LoadingState
    title="Loading Agent"
    description="This may take a few seconds"
  />
);

export const AgentsIdViewErrorState = () => (
  <ErrorState title="Error Loading Agent" description="Something went wrong" />
);
