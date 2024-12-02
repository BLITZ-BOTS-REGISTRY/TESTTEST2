import mongoose from "mongoose";
import { type ChannelDocument, type ChannelType, Channel } from "@/models/channel";
import { Collection } from "discord.js";
import { Prompt, type PromptDocument } from "@/models/prompt";

export class DatabaseWrapper {
  private channelCache: Collection<
    string,
    {
      data: ChannelDocument;
      lastFetched: number;
    }
  > = new Collection();

  private promptCache: Collection<
    string,
    {
      data: PromptDocument; // Replace with your Prompt type
      lastFetched: number;
    }
  > = new Collection();

  private CACHE_TTL = 5 * 60 * 1000;

  async connect(uri: string) {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  }

  async getChannel(channelId: string): Promise<ChannelDocument> {
    const now = Date.now();
    const cached = this.channelCache.get(channelId);

    if (cached && now - cached.lastFetched < this.CACHE_TTL) {
      return cached.data;
    }

    let channel =
      (await Channel.findOne({ channelId })) || (await Channel.create({ channelId }));
    console.log(`Fetched (or created) channel ${channelId}`);

    this.channelCache.set(channelId, {
      data: channel,
      lastFetched: now,
    });

    return channel;
  }

  async updateChannel(channelId: string, updates: Partial<ChannelType>) {
    const channel = await this.getChannel(channelId);
    await channel.updateOne(updates);
    this.channelCache.delete(channelId); // Auto-invalidate on update
    console.log(`${channelId} updated with ${JSON.stringify(updates)}`);
    return channel;
  }

  async getPrompt(name: string) {
    const now = Date.now();
    const cached = this.promptCache.get(name);

    if (cached && now - cached.lastFetched < this.CACHE_TTL) {
      return cached.data;
    }

    const prompt = await Prompt.findOne({ name });

    if (prompt) {
      this.promptCache.set(name, {
        data: prompt,
        lastFetched: now,
      });
    }

    return prompt;
  }

  async createPrompt(_name: string, content: string, creatorId: string) {
    const name = _name.toLowerCase();
    const existingPrompt = await Prompt.findOne({ name });
    if (existingPrompt) {
      throw new Error(`Prompt with name ${name} already exists`);
    }

    const prompt = await Prompt.create({ name, systemMessage: content, creatorId });
    this.promptCache.set(name, {
      data: prompt,
      lastFetched: Date.now(),
    });
    return prompt;
  }

  async updatePrompt(_name: string, content: string) {
    const name = _name.toLowerCase();
    const prompt = await Prompt.findOneAndUpdate(
      { name },
      { systemMessage: content },
      { new: true }
    );
    if (prompt) {
      this.promptCache.set(name, {
        data: prompt,
        lastFetched: Date.now(),
      });
    }
    return prompt;
  }

  async deletePrompt(name: string) {
    const result = await Prompt.deleteOne({ name });
    this.promptCache.delete(name);
    return result.deletedCount > 0;
  }

  async getAllPrompts() {
    const prompts = await Prompt.find({});
    prompts.forEach((prompt) => {
      this.promptCache.set(prompt.name, {
        data: prompt,
        lastFetched: Date.now(),
      });
    });
    return prompts;
  }

  async fetchAllPromptNames(): Promise<string[]> {
    const prompts = await Prompt.distinct("name");
    return prompts;
  }
}

export const db = new DatabaseWrapper();
