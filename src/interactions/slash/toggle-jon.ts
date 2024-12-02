import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  type CacheType,
} from "discord.js";
import { db } from "@/db";

export const toggleJonCommand = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const channel = await db.getChannel(interaction.channelId);
  const enabled = interaction.options.getBoolean("enabled")!;

  if (channel.toJSON().enabled !== enabled) {
    await db.updateChannel(interaction.channelId, {
      enabled,
    });
  }

  await interaction.reply({
    ephemeral: false,
    embeds: [
      new EmbedBuilder()
        .setDescription(`# 👍`)
        .setColor(enabled ? Colors.Green : Colors.Red),
    ],
  });
};
