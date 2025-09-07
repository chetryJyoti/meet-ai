import { useState } from "react";
import { useCall, StreamTheme } from "@stream-io/video-react-sdk";

interface Props {
  meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

  const handleJoin = async () => {
    if (!call) return;
    await call.join();
    setShow("call");
  };

  const handleLeave = async () => {
    if (!call) return;
    await call.endCall();
    setShow("ended");
  };

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <p>Lobby</p>}
      {show === "call" && <p>Call</p>}
      {show === "ended" && <p>Ended</p>}
    </StreamTheme>
  );
};
