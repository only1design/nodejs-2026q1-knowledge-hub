import { createMock } from '@golevelup/ts-vitest';
import { ForbiddenError, NotFoundError } from '../common/errors/app.errors';
import { Test } from '@nestjs/testing';
import { UserRole } from '../../generated/prisma/enums';
import { ArticleRepository } from './repository/article.repository';
import { ArticleService } from './article.service';
import { ArticleStatus } from './entities/article.entity';

const mockArticle = {
  id: 'article-id',
  title: 'Test Article',
  content: 'Test Content',
  status: ArticleStatus.DRAFT,
  authorId: 'author-id',
  categoryId: 'category-id',
  tags: ['tag1'],
  createdAt: BigInt(Date.now()),
  updatedAt: BigInt(Date.now()),
};

describe('ArticleService', () => {
  let articleService: ArticleService;
  let articleRepository: ArticleRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: {
            create: vi.fn(),
            findById: vi.fn(),
            update: vi.fn(),
            findAll: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    })
      .useMocker(() => createMock())
      .compile();

    articleService = moduleRef.get(ArticleService);
    articleRepository = moduleRef.get(ArticleRepository);
  });

  describe('findOne', () => {
    it('should throw 404 when article does not exist', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue(undefined);

      await expect(articleService.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundError('Article not found'),
      );
    });

    it('should return article when it exists', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue(mockArticle);

      await expect(articleService.findOne(mockArticle.id)).resolves.toEqual(
        mockArticle,
      );
    });
  });

  describe('remove', () => {
    it('should throw 404 when article does not exist', async () => {
      vi.spyOn(articleRepository, 'delete').mockResolvedValue(false as never);

      await expect(articleService.remove('non-existent-id')).rejects.toThrow(
        new NotFoundError('Article not found'),
      );
    });

    it('should resolve without error when article exists', async () => {
      vi.spyOn(articleRepository, 'delete').mockResolvedValue(true as never);

      await expect(
        articleService.remove(mockArticle.id),
      ).resolves.toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create article with id and timestamps', async () => {
      vi.spyOn(articleRepository, 'create');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...createDto } = mockArticle;

      await articleService.create(createDto);

      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          id: expect.any(String),
          createdAt: expect.any(BigInt),
          updatedAt: expect.any(BigInt),
        }),
      );
    });
  });

  describe('update status transitions', () => {
    const currentUser = {
      userId: 'author-id',
      login: 'author',
      role: UserRole.editor,
    };

    it.each([
      { from: ArticleStatus.DRAFT, to: ArticleStatus.PUBLISHED },
      { from: ArticleStatus.PUBLISHED, to: ArticleStatus.ARCHIVED },
    ])('should transition from $from to $to', async ({ from, to }) => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue({
        ...mockArticle,
        status: from,
      });
      vi.spyOn(articleRepository, 'update');

      await articleService.update(mockArticle.id, { status: to }, currentUser);

      expect(articleRepository.update).toHaveBeenCalledWith(mockArticle.id, {
        status: to,
      });
    });

    it('should throw if article not found', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue(undefined);

      await expect(
        articleService.update(
          'non-existent-id',
          { status: ArticleStatus.PUBLISHED },
          currentUser,
        ),
      ).rejects.toThrow(new NotFoundError('Article not found'));
    });

    it('should throw if editor updates another users article', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue({
        ...mockArticle,
        authorId: 'other-author-id',
      });

      await expect(
        articleService.update(
          mockArticle.id,
          { status: ArticleStatus.PUBLISHED },
          currentUser,
        ),
      ).rejects.toThrow(
        new ForbiddenError('You can only edit your own articles'),
      );
    });

    it('should allow admin to update any article', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue({
        ...mockArticle,
        authorId: 'other-author-id',
      });
      vi.spyOn(articleRepository, 'update');

      const adminUser = {
        userId: 'admin-id',
        login: 'admin',
        role: UserRole.admin,
      };

      await articleService.update(
        mockArticle.id,
        { status: ArticleStatus.PUBLISHED },
        adminUser,
      );

      expect(articleRepository.update).toHaveBeenCalled();
    });
  });

  describe('exist', () => {
    it('should return true when article exists', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue(mockArticle);

      await expect(articleService.exist(mockArticle.id)).resolves.toBe(true);
    });

    it('should return false when article does not exist', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue(undefined);

      await expect(articleService.exist('non-existent-id')).resolves.toBe(
        false,
      );
    });
  });

  describe('filtering', () => {
    it.each([
      { filter: { status: 'published' }, name: 'status' },
      { filter: { categoryId: 'category-id' }, name: 'categoryId' },
      { filter: { tag: 'nestjs' }, name: 'tag' },
      {
        filter: { status: 'draft', categoryId: 'id', tag: 'ts' },
        name: 'multiple filters',
      },
    ])('should pass $name filter to repository', async ({ filter }) => {
      vi.spyOn(articleRepository, 'findAll').mockResolvedValue([]);

      await articleService.findAll(filter);

      expect(articleRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('tag management', () => {
    const currentUser = {
      userId: 'author-id',
      login: 'author',
      role: UserRole.editor,
    };

    it('should pass tags to repository on create', async () => {
      vi.spyOn(articleRepository, 'create');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...createDto } = mockArticle;
      const tags = ['nestjs', 'typescript', 'prisma'];

      await articleService.create({ ...createDto, tags });

      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ tags }),
      );
    });

    it('should pass updated tags to repository on update', async () => {
      vi.spyOn(articleRepository, 'findById').mockResolvedValue(mockArticle);
      vi.spyOn(articleRepository, 'update');

      const newTags = ['docker', 'devops'];

      await articleService.update(
        mockArticle.id,
        { tags: newTags },
        currentUser,
      );

      expect(articleRepository.update).toHaveBeenCalledWith(mockArticle.id, {
        tags: newTags,
      });
    });

    it('should pass empty tags array on create', async () => {
      vi.spyOn(articleRepository, 'create');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, createdAt, updatedAt, ...createDto } = mockArticle;

      await articleService.create({ ...createDto, tags: [] });

      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ tags: [] }),
      );
    });
  });
});
