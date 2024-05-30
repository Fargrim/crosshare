#!/usr/bin/env -S npx tsx

import { getClues, getDB } from '../lib/ginsberg.js';

if (process.argv.length !== 3) {
  throw Error(
    'Invalid use of readGinsberg. Usage: ./scripts/readGinsberg.ts [wordToLookup]'
  );
}

const word = process.argv[2];
if (!word) {
  throw Error('oob');
}

const db = getDB(true);
getClues(db, word)
  .then(async (c) => {
    console.log(JSON.stringify(c, null, 2));
    await db.close();
  })
  .catch((e: unknown) => {
    console.error(e);
  });
