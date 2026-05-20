import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-vitest';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { IS_PUBLIC_KEY, Public, CurrentUser } from './auth.decorators';

describe('Public decorator', () => {
  it('should set isPublic metadata to true on class', () => {
    class DummyController {}
    Public()(DummyController);

    expect(Reflect.getMetadata(IS_PUBLIC_KEY, DummyController)).toBe(true);
  });
});

describe('CurrentUser decorator', () => {
  it('should extract user from request via stored factory', () => {
    class DummyController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler(_user: unknown) {}
    }

    // Apply the decorator so NestJS stores the factory in route args metadata
    const paramDecorator = CurrentUser();
    paramDecorator(DummyController.prototype, 'handler', 0);

    const argsMetadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      DummyController,
      'handler',
    );

    // Extract the factory from the stored metadata entry
    const [entry] = Object.values(argsMetadata) as any[];
    const factory = entry.factory;

    const mockUser = { userId: '1', role: 'viewer' };
    const ctx = createMock<ExecutionContext>({
      switchToHttp: () => ({ getRequest: () => ({ user: mockUser }) }),
    });

    expect(factory(undefined, ctx)).toEqual(mockUser);
  });
});
