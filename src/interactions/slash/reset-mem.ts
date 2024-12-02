import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  type CacheType,
} from "discord.js";
import { messageStore } from "@/messages";

export const resetMemCommand = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  messageStore.delete(interaction.channelId);

  await interaction.reply({
    ephemeral: false,
    embeds: [
      new EmbedBuilder().setDescription(`# Memoria cancellata.`).setColor(Colors.Green),
    ],
  });
};
