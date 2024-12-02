import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  type CacheType,
} from "discord.js";
import { db } from "@/db";
import type { Model } from "@/groq";

export const changeModelCommand = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const channel = await db.getChannel(interaction.channelId);
  if (!channel) return;
  const channelJson = channel.toJSON();

  const currentModel = channelJson.aiModel;
  const newModel = interaction.options.getString("model") as Model;

  if (currentModel === newModel) {
    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setDescription(`## Nulla è cambiato.`)
          .setColor(Colors.Orange)
          .setFooter({
            text: `Il modello era già "${currentModel}"`,
          }),
      ],
    });
    return;
  }

  await db.updateChannel(interaction.channelId, { aiModel: newModel });

  await interaction.reply({
    ephemeral: false,
    embeds: [
      new EmbedBuilder()
        .setDescription(`# \`${currentModel}\` -> \`${newModel}\``)
        .setColor(Colors.Green)
        .setFooter({
          text: "La memoria non è stata cancellata, puoi continuare la conversazione precedente.",
        }),
    ],
  });
};
