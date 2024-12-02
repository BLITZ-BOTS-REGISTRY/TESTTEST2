import type { CacheType, ChatInputCommandInteraction, Interaction } from "discord.js";
import { changePromptCommand } from "@/interactions/slash/change-prompt";
import { resetMemCommand } from "@/interactions/slash/reset-mem";
import { managePromptCommand } from "@/interactions/slash/manage-prompt";
import { changeModelCommand } from "@/interactions/slash/change-model";
import { toggleJonCommand } from "./slash/toggle-jon";

const commandFunctions: {
  [key: string]: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
} = {
  "change-prompt": changePromptCommand,
  "reset-mem": resetMemCommand,
  "manage-prompt": managePromptCommand,
  "change-model": changeModelCommand,
  "toggle-jon": toggleJonCommand,
} as const;

export const slashCommand = async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.channelId) return;

  const func = commandFunctions[interaction.commandName];
  if (!func) {
    await interaction.reply({
      ephemeral: true,
      content: "Comando non trovato.",
    });
    return;
  }

  await func(interaction);
};
