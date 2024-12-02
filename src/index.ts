import { ActivityType, Client, Colors, Partials } from "discord.js";
import { askGroq, type Model } from "@/groq";
import { allIntents } from "@/utils";
import { db } from "@/db";
import { autoComplete } from "@/interactions/autocomplete";
import { slashCommand } from "@/interactions/slash";
import { contextMenu } from "@/interactions/context";
import { defaultModel, defaultpromptName } from "@/config";
import { messageStore } from "@/messages";

const client = new Client({
  intents: allIntents,
  presence: {
    activities: [{ name: "Talk Tuah", type: ActivityType.Listening }],
  },
  partials: [Partials.Channel, Partials.Message],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.author.id === client.user?.id) return;
  if (!message.content && !message.attachments.at(0)?.url) return;

  const channel = await db.getChannel(message.channelId);
  const channelData = channel.toJSON();

  if (message.guild && !channelData.enabled) return;

  if (!messageStore.hasChannel(message.channelId)) {
    await messageStore.initChannel(message.channelId, message.channel);
  }

  messageStore.addMessage(message.channelId, message);
  const recentMessages = messageStore.getMessages(message.channelId);

  try {
    message.channel.sendTyping();
    const [response, err] = await askGroq({
      messages: recentMessages,
      promptName: channelData.promptName ?? defaultpromptName,
      model: (channelData.aiModel as Model | undefined) ?? defaultModel,
    });
    if (err || !response) {
      await message.reply({
        embeds: [{ title: ("errore :c\n" + err?.toString()).trim(), color: Colors.Red }],
      });
      console.log(err, response);
      return;
    }

    const dmsg = await message.channel.send(response);

    console.log(
      `
${message.author.displayName}: ${message.content}
jon: ${response}
`.trim() + "\n"
    );

    messageStore.addMessage(message.channelId, dmsg);
  } catch (error) {
    console.error("Failed to generate response:", error);
  }
});

client.on("interactionCreate", slashCommand);
client.on("interactionCreate", contextMenu);
client.on("interactionCreate", autoComplete);

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
});

await db.connect(Bun.env.MONGODB_URI!);

client.login(Bun.env.DISCORD_TOKEN);
