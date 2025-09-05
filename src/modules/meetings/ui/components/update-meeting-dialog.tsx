import { MeetingGetOne } from "../../types";
import { MeetingForm } from "./meeting-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface UpdateMeetingDilaogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: MeetingGetOne;
}

export const UpdateMeetingDilaog = ({
  open,
  onOpenChange,
  initialValues,
}: UpdateMeetingDilaogProps) => {

  return (
    <ResponsiveDialog
      title="Update Meeting"
      description="Update the meeting details"
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};
