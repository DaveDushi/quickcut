export const TRANSCRIPT_GENERATION_FLAG = "transcript-generation";

interface FlagUser {
  id: string;
  email: string;
}

export async function isTranscriptGenerationEnabled(
  env: Env,
  user: FlagUser | null | undefined,
): Promise<boolean> {
  if (!user) return false;
  return env.TRANSCRIPTS_ENABLED !== "false";
}
