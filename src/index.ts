import { Bot, webhookCallback } from "grammy";
import { Chat, User, UserFromGetMe } from "grammy/types";


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
        "Hello! Forward me a message, and I'll respond with that user or channel info. Or just say something, and I'll send your own user info! I talk JSON so I'll just send you the raw object.\n\n" +
        "I'm open source:\nhttps://github.com/nelsonjchen/userinfofwdbot"
      ));

      bot.on("message", async (ctx) => {
        // Default to the user who sent the message
        let source: User | Chat | {
          username: string;
          _note: string;
        } = ctx.from;
        // If the message was forwarded, use the original sender of the message
        if (ctx.message.forward_origin) {
          const forward_origin = ctx.message.forward_origin;
          if (forward_origin.type === "hidden_user") {
            source = {
              username: forward_origin.sender_user_name,
              _note: "This user has turned on forward privacy. I can't see their user ID. Use Telegram Web to try to \"directly message\" them and the user ID will be in the URL. No need to actually send a message."
            }
          }
          if (forward_origin.type === "user") {
            source = forward_origin.sender_user;
          }
          if (forward_origin.type === "channel") {
            source = forward_origin.chat
          }
        }
        await ctx.reply(
          `<code>
${JSON.stringify(source, null, 2)}
</code>`,
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
            parse_mode: "HTML"
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