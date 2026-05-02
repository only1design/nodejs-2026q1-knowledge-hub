import { validate } from 'class-validator';
import { SignupDto } from './signup.dto';

const makeDto = (overrides: Partial<SignupDto> = {}): SignupDto =>
  Object.assign(new SignupDto(), {
    login: 'alice',
    password: 'secret',
    ...overrides,
  });

describe('SignupDto', () => {
  it('should pass with valid data', async () => {
    const errors = await validate(makeDto());
    expect(errors).toHaveLength(0);
  });

  it.each([
    { field: 'login', override: { login: '' }, label: 'empty login' },
    { field: 'password', override: { password: '' }, label: 'empty password' },
  ])('should fail when $label', async ({ field, override }) => {
    const errors = await validate(makeDto(override));
    expect(errors.some((e) => e.property === field)).toBe(true);
  });

  it('should fail when login is missing', async () => {
    const dto = Object.assign(new SignupDto(), { password: 'secret' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'login')).toBe(true);
  });

  it('should fail when password is missing', async () => {
    const dto = Object.assign(new SignupDto(), { login: 'alice' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail when login is not a string', async () => {
    const errors = await validate(makeDto({ login: 123 as unknown as string }));
    expect(errors.some((e) => e.property === 'login')).toBe(true);
  });
});
