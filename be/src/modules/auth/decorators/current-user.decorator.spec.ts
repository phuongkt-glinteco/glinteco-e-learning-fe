/* eslint-disable */
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';
import { User } from '../../../database/entities/user.entity';

// Helper to extract the parameter decorator's factory function
function getParamDecoratorFactory(decorator: Function) {
  class Test {
    test(@decorator() value: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser Decorator', () => {
  it('should return the user from request object', () => {
    const factory = getParamDecoratorFactory(CurrentUser);

    const mockUser = { id: 'user-123', email: 'test@example.com' } as User;
    const mockRequest = { user: mockUser };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
    expect(result).toBe(mockUser);
  });
});
