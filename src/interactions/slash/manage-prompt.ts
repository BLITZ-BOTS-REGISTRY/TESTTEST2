import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  type CacheType,
} from "discord.js";
import { db } from "@/db";

type Action = "edit" | "create" | "delete" | "get";

export const managePromptCommand = async (
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  const prompt = interaction.options.getString("prompt");
  const targetPromptName = interaction.options.getString("name")!;
  const action = interaction.options.getString("action")! as Action;

  switch (action) {
    case "edit": {
      if (prompt) {
        const fetchedExistingPrompt = await db.getPrompt(targetPromptName);

        if (!fetchedExistingPrompt) {
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setDescription(`## Prompt non trovato.`)
                .setColor(Colors.Red)
                .setFooter({
                  text: `Il prompt \`${targetPromptName}\` non esiste.`,
                }),
            ],
          });
          return;
        }

        if (fetchedExistingPrompt.toJSON().creatorId !== interaction.user.id) {
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setDescription(`## Non puoi modificare questo prompt.`)
                .setColor(Colors.Red)
                .setFooter({
                  text: `Il prompt \`${targetPromptName}\` non è tuo.`,
                }),
            ],
          });
          return;
        }

        /* edit logic */
        await db.updatePrompt(targetPromptName, prompt);

        await interaction.reply({
          ephemeral: false,
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `# \`old (${
                  fetchedExistingPrompt.toJSON().systemMessage.length
                })\` -> \`new (${prompt.length})\``
              )
              .setColor(Colors.Green)
              .setFooter({
                text: `"${targetPromptName}" è stato modificato.`,
              }),
          ],
        });
        return;
      }
      break;
    }

    case "create": {
      if (prompt) {
        const existingPrompt = await db.getPrompt(targetPromptName);

        if (existingPrompt) {
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                .setDescription(`## Prompt già esistente.`)
                .setColor(Colors.Red)
                .setFooter({
                  text: `Il prompt \`${targetPromptName}\` esiste già.`,
                }),
            ],
          });
          return;
        }

        await db.createPrompt(targetPromptName, prompt, interaction.user.id);

        await interaction.reply({
          ephemeral: false,
          embeds: [
            new EmbedBuilder()
              .setDescription(`# Nuovo prompt creato: \`${targetPromptName}\``)
              .setColor(Colors.Green)
              .setFooter({
                text: `Lunghezza: ${prompt.length} caratteri`,
              }),
          ],
        });
        return;
      }
      break;
    }

    case "delete": {
      const existingPrompt = await db.getPrompt(targetPromptName);

      if (!existingPrompt) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setDescription(`## Prompt non trovato.`)
              .setColor(Colors.Red)
              .setFooter({
                text: `Il prompt \`${targetPromptName}\` non esiste.`,
              }),
          ],
        });
        return;
      }

      if (existingPrompt.toJSON().creatorId !== interaction.user.id) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setDescription(`## Non puoi modificare questo prompt.`)
              .setColor(Colors.Red)
              .setFooter({
                text: `Il prompt \`${targetPromptName}\` non è tuo.`,
              }),
          ],
        });
        return;
      }

      await db.deletePrompt(targetPromptName);

      await interaction.reply({
        ephemeral: false,
        embeds: [
          new EmbedBuilder()
            .setDescription(`# \`${targetPromptName}\` eliminato.`)
            .setColor(Colors.Green)
            .setFooter({
              text: `Il prompt \`${targetPromptName}\` è stato eliminato.`,
            }),
        ],
      });
      return;
    }

    case "get": {
      const fetchedExistingPrompt = await db.getPrompt(targetPromptName);
      if (!fetchedExistingPrompt) {
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setDescription(`## Prompt non trovato.`)
              .setColor(Colors.Red)
              .setFooter({
                text: `Il prompt \`${targetPromptName}\` non esiste.`,
              }),
          ],
        });
        return;
      }

      await interaction.reply({
        ephemeral: false,
        embeds: [
          new EmbedBuilder()
            .setTitle(targetPromptName)
            .setDescription(`\`\`\`${fetchedExistingPrompt.toJSON().systemMessage}\`\`\``)
            .setColor(Colors.Green)
            .setFooter({
              text: `Lunghezza: ${
                fetchedExistingPrompt.toJSON().systemMessage.length
              } caratteri`,
            }),
        ],
      });
      return;
    }
  }

  await interaction.reply({
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setDescription(`# Devi inserire un \`prompt\`.`)
        .setColor(Colors.Red),
    ],
  });
};
