import { validate } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';
import { ArticleStatus } from '../entities/article.entity';

const VALID_UUID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

const makeDto = (overrides: Partial<CreateArticleDto> = {}): CreateArticleDto =>
  Object.assign(new CreateArticleDto(), {
    title: 'Hello World',
    content: 'Some content',
    status: ArticleStatus.DRAFT,
    tags: ['nestjs'],
    ...overrides,
  });

describe('CreateArticleDto', () => {
  it('should pass with valid required fields', async () => {
    const errors = await validate(makeDto());
    expect(errors).toHaveLength(0);
  });

  it('should pass with valid optional UUID fields', async () => {
    const errors = await validate(
      makeDto({ authorId: VALID_UUID, categoryId: VALID_UUID }),
    );
    expect(errors).toHaveLength(0);
  });

  it.each([
    { label: 'empty title', override: { title: '' } },
    { label: 'empty content', override: { content: '' } },
  ])('should fail for $label', async ({ override }) => {
    const errors = await validate(makeDto(override));
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when status is an invalid enum value', async () => {
    const errors = await validate(
      makeDto({ status: 'invalid' as ArticleStatus }),
    );
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it.each([
    { field: 'authorId', override: { authorId: 'not-a-uuid' } },
    { field: 'categoryId', override: { categoryId: 'malformed-123' } },
  ])(
    'should fail when $field is not a valid UUID',
    async ({ field, override }) => {
      const errors = await validate(makeDto(override));
      expect(errors.some((e) => e.property === field)).toBe(true);
    },
  );

  it('should fail when tags is empty array items', async () => {
    const errors = await validate(makeDto({ tags: [''] }));
    expect(errors.some((e) => e.property === 'tags')).toBe(true);
  });

  it('should fail when tags contains non-strings', async () => {
    const errors = await validate(
      makeDto({ tags: [123 as unknown as string] }),
    );
    expect(errors.some((e) => e.property === 'tags')).toBe(true);
  });

  it('should fail when title is missing', async () => {
    const dto = Object.assign(new CreateArticleDto(), {
      content: 'Some content',
      status: ArticleStatus.DRAFT,
      tags: ['nestjs'],
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });
});
