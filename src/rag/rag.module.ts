import { Module } from '@nestjs/common';
import { GeminiService } from '../ai/gemini.service';
import { ArticleModule } from '../article/article.module';
import { ConversationStore } from './conversation/conversation.store';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { ArticleVectorStore } from './vector-store/article-vector.store';

@Module({
  providers: [RagService, ArticleVectorStore, GeminiService, ConversationStore],
  controllers: [RagController],
  imports: [ArticleModule],
})
export class RagModule {}
