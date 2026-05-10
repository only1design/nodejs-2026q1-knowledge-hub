import { Injectable } from '@nestjs/common';
import { ragConfig } from '../rag.constants';

export enum ConversationRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface ConversationMessage {
  role: ConversationRole;
  content: string;
}

@Injectable()
export class ConversationStore {
  private readonly store = new Map<string, ConversationMessage[]>();

  get(conversationId: string): ConversationMessage[] {
    return this.store.get(conversationId) ?? [];
  }

  append(conversationId: string, { role, content }: ConversationMessage) {
    const history = this.store.get(conversationId) ?? [];

    history.push({ role, content });

    if (history.length > ragConfig.conversation.maxMessages) {
      history.splice(0, history.length - ragConfig.conversation.maxMessages);
    }

    this.store.set(conversationId, history);
  }
}
