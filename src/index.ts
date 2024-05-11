import { Bot, Context, SessionFlavor, session, webhookCallback } from "grammy";
import { User, UserFromGetMe } from "grammy/types";


export interface Env {
  BOT_TOKEN: string;
}

let botInfo: UserFromGetMe | undefined = undefined;

export default {
  async fetch(request: Request, env: Env) {
    try {

      const bot = new Bot(env.BOT_TOKEN, { botInfo });

      if (botInfo === undefined) {
        await bot.init();
        botInfo = bot.botInfo;
      }


      bot.command("start", (ctx) => ctx.reply(
        "Hello! Forward me a message, and I'll respond with that user info. Or just say something, and I'll send your own user info! I talk JSON so I'll just send you the raw user object."
      ));

      bot.on("message", async (ctx) => {
        // Default to the user who sent the message
        let user: User = ctx.from;
        // If the message was forwarded, use the original sender of the message
        if (ctx.message.forward_origin) {
          const forward_origin = ctx.message.forward_origin;
          if (forward_origin.type === "user") {
            user = forward_origin.sender_user;
          }
        }
        await ctx.reply(JSON.stringify(user, null, 2),
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            }
          }
        );
			});

			const cb = webhookCallback(bot, "cloudflare-mod");
			return await cb(request);
		} catch (e: any) {
			console.error(e);
			return new Response(e.message);
		}
	},
}