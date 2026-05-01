import { handle } from "@astrojs/cloudflare/handler";
import { sendEmailDigests } from "./scheduled/sendEmailDigests";

// Re-export Durable Object classes so Wrangler can register them.
export { VideoRoom } from "./durable-objects/VideoRoom";
export { TranscriptWorkflow } from "./workflows/TranscriptWorkflow";

export default {
	async fetch(request, env, ctx) {
		return handle(request, env, ctx);
	},
	async scheduled(_event, env, ctx) {
		ctx.waitUntil(sendEmailDigests(env));
	},
} satisfies ExportedHandler<Env>;
