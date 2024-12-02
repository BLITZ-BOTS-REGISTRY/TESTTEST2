import { EmbedBuilder, Colors, type Interaction } from "discord.js";
import { defaultpromptName, defaultModel } from "@/config";
import { askGroq, type Model } from "@/groq";
import { db } from "@/db";

export const contextMenu = async (interaction: Interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  if (interaction.commandName === "fagli capire chi comanda") {
    const channel = await db.getChannel(interaction.channelId);
    const channelData = channel.toJSON();

    const [response, err] = await askGroq({
      messages: [interaction.targetMessage],
      promptName: channelData.promptName ?? defaultpromptName,
      model: (channelData.aiModel as Model | undefined) ?? defaultModel,
    });

    if (err || !response) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setDescription(`## Errore :c\n${err?.toString()}`)
            .setColor(Colors.Red),
        ],
      });
      return;
    }

    await interaction.reply(response);
  }
};
