import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ZodError } from "zod";
import { TextDocumentSchema, SentenceSchema, WordTokenSchema } from "../../lib/schemas/corpus";

console.log("Running corpus Zod schema validation unit tests...");

// Test 1: WordTokenSchema validation
const validToken = WordTokenSchema.parse({
  id: "token-1",
  originalWord: "Hwæt",
  morphologicalGloss: "listen.INTJ",
});
assert.equal(validToken.id, "token-1");
assert.equal(validToken.originalWord, "Hwæt");
assert.equal(validToken.morphologicalGloss, "listen.INTJ");
assert.equal(validToken.lemmaRef, null, "Default lemmaRef should be null");

let tokenError: ZodError | null = null;
try {
  WordTokenSchema.parse({ morphologicalGloss: "missing-id-and-word" });
} catch (err) {
  if (err instanceof ZodError) tokenError = err;
}
assert.ok(tokenError !== null, "Invalid WordToken must throw a ZodError");

// Test 2: SentenceSchema validation and preprocess mapping ('words' to 'tokens')
const rawSentenceWithWords = {
  id: "sent-1",
  sentenceNumber: 1,
  translation: "Listen!",
  words: [
    {
      id: "t-1",
      originalWord: "Hwæt",
      morphologicalGloss: "listen.INTJ",
    },
  ],
};

const parsedSentence = SentenceSchema.parse(rawSentenceWithWords);
assert.equal(parsedSentence.id, "sent-1");
assert.equal(parsedSentence.sentenceNumber, 1);
assert.equal(parsedSentence.originalText, "Hwæt", "Preprocess should construct originalText from tokens");
assert.equal(parsedSentence.tokens.length, 1);
assert.equal(parsedSentence.tokens[0].originalWord, "Hwæt");

// Test 3: Malformed document fails fast with detailed Zod error
const malformedDoc = {
  slug: "malformed-doc",
  title: "Malformed Document",
  sentences: [
    {
      id: "s1",
      sentenceNumber: -5, // Invalid: sentenceNumber must be positive
      tokens: [
        {
          // Missing required 'id' and 'originalWord'
          morphologicalGloss: "invalid",
        },
      ],
    },
  ],
};

let caughtError: ZodError | null = null;
try {
  TextDocumentSchema.parse(malformedDoc);
} catch (err) {
  if (err instanceof ZodError) {
    caughtError = err;
  }
}

assert.ok(caughtError !== null, "Malformed document must throw a ZodError");
assert.ok(
  caughtError.issues.length > 0,
  "ZodError must contain detailed validation issues",
);
assert.ok(
  caughtError.issues.some((i) => i.path.includes("sentenceNumber") || i.path.includes("originalWord") || i.path.includes("id")),
  `ZodError issues must pinpoint the invalid fields, got: ${JSON.stringify(caughtError.issues)}`,
);

// Test 4: Document with explicit empty string fields preserves empty strings
const emptyFieldsDoc = {
  slug: "empty-fields-test",
  title: "Test Document with Empty String Metadata",
  author: "",
  editor: "",
  date: "",
  edition: "",
  sentences: [
    {
      id: "s-1",
      sentenceNumber: 1,
      originalText: "Hwæt!",
      translation: "",
      tokens: [
        {
          id: "t-1",
          originalWord: "Hwæt!",
          morphologicalGloss: "listen",
        },
      ],
    },
  ],
};

const parsedEmptyFields = TextDocumentSchema.parse(emptyFieldsDoc);
assert.equal(
  parsedEmptyFields.editor,
  "",
  'Explicit empty editor string "" must be preserved and not overwritten',
);
assert.equal(
  parsedEmptyFields.author,
  "",
  'Explicit empty author string "" must be preserved and not overwritten',
);
assert.equal(
  parsedEmptyFields.date,
  "",
  'Explicit empty date string "" must be preserved and not overwritten',
);
assert.equal(
  parsedEmptyFields.edition,
  "",
  'Explicit empty edition string "" must be preserved and not overwritten',
);

// Test 5: Document without optional string fields applies schema defaults
const defaultFieldsDoc = {
  slug: "default-fields-test",
  title: "Test Document for Defaults",
  sentences: [
    {
      id: "s-1",
      tokens: [
        {
          id: "t-1",
          originalWord: "Wē",
        },
      ],
    },
  ],
};

const parsedDefaults = TextDocumentSchema.parse(defaultFieldsDoc);
assert.equal(
  parsedDefaults.author,
  "Anonymous",
  'Missing author must default to "Anonymous"',
);
assert.equal(
  parsedDefaults.editor,
  "",
  'Missing editor must default to ""',
);

// Test 6: Parse all actual corpus fixture files in content/texts/
const corpusDir = path.join(process.cwd(), "content", "texts");
const corpusFiles = fs.readdirSync(corpusDir).filter((f) => f.endsWith(".json"));

assert.ok(corpusFiles.length > 0, "Corpus directory content/texts/ must contain JSON files");

for (const file of corpusFiles) {
  const filePath = path.join(corpusDir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  const validated = TextDocumentSchema.parse(parsed);
  assert.equal(
    validated.slug,
    parsed.slug,
    `Corpus file "${file}" slug must match parsed output`,
  );
  assert.ok(
    validated.sentences.length > 0,
    `Corpus file "${file}" must have at least one sentence`,
  );
}

console.log(`✓ Validated ${corpusFiles.length} real corpus fixture files in content/texts/ successfully!`);
console.log("✓ All corpus Zod schema validation unit tests passed successfully!");
