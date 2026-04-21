import { vi } from 'vitest';

vi.mock('@nestjs-cls/transactional', () => ({
  Transactional: () => () => ({}),
}));
