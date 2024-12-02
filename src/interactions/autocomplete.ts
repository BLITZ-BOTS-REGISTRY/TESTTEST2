import type { Interaction } from "discord.js";
import { db } from "@/db";

export const autoComplete = async (interaction: Interaction) => {
  if (!interaction.isAutocomplete()) return;
  if (
    interaction.commandName !== "change-prompt" &&
    interaction.commandName !== "manage-prompt"
  )
    return;
  // do autocomplete handling
  const focusedValue = interaction.options.getFocused();
  const choices = await db.fetchAllPromptNames();
  const filtered = choices.filter((choice) =>
    choice.toLowerCase().startsWith(focusedValue.toLowerCase())
  );
  await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
};
