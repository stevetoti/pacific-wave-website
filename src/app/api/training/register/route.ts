import { after } from "next/server";
import { registerTraining } from "@/lib/server/training-register";
export const maxDuration = 60;
export async function POST(request: Request) {
  return registerTraining(request, after);
}
