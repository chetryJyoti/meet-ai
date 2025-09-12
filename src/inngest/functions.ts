import { inngest } from "./client";
import JSONL from "jsonl-parse-stringify";
import { StreamTranscriptionItem } from "@/modules/meetings/types";

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    const response = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text());
    });

    const transcript = await step.run("parse-transcript", async () => {
      return JSONL.parse<StreamTranscriptionItem>(response);
    });

    
  }
);
