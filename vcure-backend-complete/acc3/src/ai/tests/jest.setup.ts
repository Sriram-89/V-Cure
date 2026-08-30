import 'reflect-metadata';

// Node >=19 has a global `crypto.randomUUID`; ensure it's present under Jest's
// node environment regardless of exact Node version used in CI.
if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require('crypto');
  // @ts-expect-error - polyfilling for test environment only
  globalThis.crypto = { randomUUID: () => nodeCrypto.randomUUID() };
}
