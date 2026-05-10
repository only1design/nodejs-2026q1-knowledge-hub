import { createHash } from 'node:crypto';
import { WordTokenizer } from 'natural';
import { eng, removeStopwords, rus } from 'stopword';

const VOCAB_SIZE = 100_000;
const MIN_TOKEN_LENGTH = 2;

const tokenizer = new WordTokenizer();

export interface SparseVector {
  indices: number[];
  values: number[];
}

const tokenize = (text: string): string[] => {
  const tokens = tokenizer
    .tokenize(text.toLowerCase())
    .filter((token) => token.length >= MIN_TOKEN_LENGTH);
  return removeStopwords(tokens, [...eng, ...rus]);
};

const hashToken = (token: string): number => {
  const hash = createHash('md5').update(token).digest('hex');
  return parseInt(hash.slice(0, 8), 16) % VOCAB_SIZE;
};

export const computeSparseVector = (text: string): SparseVector => {
  const tokens = tokenize(text);
  const tf = new Map<number, number>();

  for (const token of tokens) {
    const id = hashToken(token);
    tf.set(id, (tf.get(id) ?? 0) + 1);
  }

  const length = tokens.length || 1;
  const indices = [...tf.keys()];
  const values = indices.map((id) => (tf.get(id) ?? 0) / length);

  return { indices, values };
};
