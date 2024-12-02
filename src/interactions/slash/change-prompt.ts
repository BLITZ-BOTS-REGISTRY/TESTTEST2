import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  type CacheType,
} from "discord.js";
import { db } from "@/db";

export const changePromptCommand = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const channel = await db.getChannel(interaction.channelId);
  if (!channel) return;
  const channelJson = channel.toJSON();

  const currentPrompt = channelJson.promptName;
  const newPrompt = interaction.options.getString("prompt")!;

  const fetchedNewPrompt = await db.getPrompt(newPrompt);

  if (!fetchedNewPrompt) {
    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setDescription(`## Prompt non trovato.`)
          .setColor(Colors.Red)
          .setFooter({
            text: `Il prompt \`${newPrompt}\` non esiste.`,
          }),
      ],
    });
    return;
  }

  if (currentPrompt === newPrompt) {
    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setDescription(`## Nulla è cambiato.`)
          .setColor(Colors.Orange)
          .setFooter({
            text: `Il prompt era già "${currentPrompt}"`,
          }),
      ],
    });
    return;
  }

  await db.updateChannel(interaction.channelId, { promptName: newPrompt });

  await interaction.reply({
    ephemeral: false,
    embeds: [
      new EmbedBuilder()
        .setDescription(`# \`${currentPrompt}\` -> \`${newPrompt}\``)
        .setColor(Colors.Green)
        .setFooter({
          text: "La memoria non è stata cancellata, puoi continuare la conversazione precedente.",
        }),
    ],
  });
};
