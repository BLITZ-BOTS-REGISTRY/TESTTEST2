import { Collection, Message } from "discord.js";
import { memoryLength } from "@/config";

export class MessageStore {
  private messages: Map<string, Message[]>;
  private readonly maxLength: number;

  constructor(maxLength: number = 15) {
    this.messages = new Map();
    this.maxLength = maxLength;
  }

  async initChannel(
    channelId: string,
    channel: {
      messages: { fetch: (options: any) => Promise<Collection<string, Message>> };
    }
  ) {
    const previousMessages = await channel.messages.fetch({ limit: this.maxLength });
    this.messages.set(
      channelId,
      Array.from(previousMessages.values()).reverse() as Message[]
    );
  }

  addMessage(channelId: string, message: Message) {
    if (!this.messages.has(channelId)) {
      this.messages.set(channelId, []);
    }

    const channelMessages = this.messages.get(channelId)!;
    channelMessages.push(message);

    if (channelMessages.length > this.maxLength) {
      channelMessages.shift();
    }
  }

  setMessages(channelId: string, messages: Message[]) {
    this.messages.set(channelId, messages);
  }

  getMessages(channelId: string): Message[] {
    return this.messages.get(channelId) || [];
  }

  hasChannel(channelId: string): boolean {
    return this.messages.has(channelId);
  }

  delete(channelId: string) {
    this.setMessages(channelId, []);
  }
}

export const messageStore = new MessageStore(memoryLength);
