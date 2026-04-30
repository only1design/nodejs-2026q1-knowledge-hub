import { ApiError, GenerateContentConfig, GoogleGenAI } from '@google/genai';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  InternalServiceError,
  ServiceUnavailableError,
} from '../errors/app.errors';
import { aiConfig } from './ai.constants';

@Injectable()
export class GeminiService {
  private ai = new GoogleGenAI({
    apiKey: aiConfig.gemini.apiKey,
    httpOptions: {
      timeout: 60_000,
    },
  });
  private logger = new Logger(GeminiService.name);

  async generateContent(contents: string, config?: GenerateContentConfig) {
    for (let attempt = 0; attempt <= aiConfig.maxRetries; attempt++) {
      try {
        return await this.ai.models.generateContent({
          model: aiConfig.gemini.model,
          contents,
          config,
        });
      } catch (e) {
        if (e instanceof ApiError) {
          this.logger.error(
            `Gemini API error (status ${e.status}): ${e.message}`,
          );

          if (
            e.status === HttpStatus.UNAUTHORIZED ||
            e.status === HttpStatus.FORBIDDEN
          ) {
            throw new InternalServiceError('AI service configuration error');
          }

          if (
            e.status === HttpStatus.TOO_MANY_REQUESTS &&
            attempt < aiConfig.maxRetries
          ) {
            const delay = Math.pow(2, attempt) * 1000;
            this.logger.warn(
              `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${aiConfig.maxRetries})`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        } else {
          this.logger.error('Unexpected Gemini error', e);
        }

        throw new ServiceUnavailableError(
          'AI service is temporarily unavailable',
        );
      }
    }
  }
}
