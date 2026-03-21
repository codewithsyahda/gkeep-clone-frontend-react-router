import { expect, test } from 'vitest';
import add from './math';

test('Should add two numbers', () => {
  expect(add(2, 2)).toBe(4);
});
