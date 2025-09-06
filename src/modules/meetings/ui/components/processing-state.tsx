import { EmptyState } from "@/components/empty-state";

export const ProcesingState = () => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/processing.svg"
        title="Meeting completed"
        description="The meeting has been completed and is being processed. The summary will be available shortly."
      />
    </div>
  );
};
