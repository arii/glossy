import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { ZodError } from "zod";
import {
  WordTokenSchema,
  SentenceSchema,
  TextDocumentSchema,
} from "../../lib/schemas/corpus";

test("WordTokenSchema parses valid token data", () => {
  const token = {
    id: "token-1",
    originalWord: "Hwæt",
    morphologicalGloss: "listen",
  };
  const parsed = WordTokenSchema.parse(token);
  assert.strictEqual(parsed.id, "token-1");
  assert.strictEqual(parsed.originalWord, "Hwæt");
  assert.strictEqual(parsed.morphologicalGloss, "listen");
  assert.strictEqual(parsed.lemmaRef, null);
});

test("SentenceSchema parses valid sentence data and supports words fallback", () => {
  const sentence = {
    id: "sent-1",
    translation: "Listen!",
    words: [
      {
        id: "t1",
        originalWord: "Hwæt!",
        morphologicalGloss: "listen",
      },
    ],
  };
  const parsed = SentenceSchema.parse(sentence);
  assert.strictEqual(parsed.id, "sent-1");
  assert.strictEqual(parsed.sentenceNumber, 1);
  assert.strictEqual(parsed.originalText, "Hwæt!");
  assert.strictEqual(parsed.translation, "Listen!");
  assert.strictEqual(parsed.tokens.length, 1);
  assert.strictEqual(parsed.tokens[0].originalWord, "Hwæt!");
});

test("TextDocumentSchema preserves valid empty string fields without overwriting", () => {
  const doc = {
    slug: "custom-text",
    title: "Custom Text Document",
    author: "",
    editor: "",
    date: "",
    edition: "",
    sentences: [
      {
        id: "s1",
        sentenceNumber: 1,
        originalText: "Hwæt!",
        translation: "Listen!",
        tokens: [
          {
            id: "t1",
            originalWord: "Hwæt!",
            morphologicalGloss: "listen",
          },
        ],
      },
    ],
  };

  const parsed = TextDocumentSchema.parse(doc);
  assert.strictEqual(parsed.slug, "custom-text");
  assert.strictEqual(parsed.title, "Custom Text Document");
  assert.strictEqual(parsed.author, "");
  assert.strictEqual(parsed.editor, "");
  assert.strictEqual(parsed.date, "");
  assert.strictEqual(parsed.edition, "");
});

test("Malformed documents fail fast with detailed Zod issues", () => {
  const invalidDocs = [
    null,
    {},
    { slug: "missing-title" },
    { slug: "bad-sentences", title: "Title", sentences: "not-an-array" },
    {
      slug: "bad-token",
      title: "Title",
      sentences: [
        {
          id: "s1",
          tokens: [{ originalWord: "missing-id" }],
        },
      ],
    },
  ];

  for (const doc of invalidDocs) {
    assert.throws(
      () => {
        TextDocumentSchema.parse(doc);
      },
      (err: unknown) => err instanceof ZodError,
      `Expected document to fail validation: ${JSON.stringify(doc)}`,
    );
  }
});

test("All corpus fixture files in content/texts/ parse without Zod validation errors", () => {
  const textsDir = path.join(process.cwd(), "content", "texts");
  const files = fs
    .readdirSync(textsDir)
    .filter((file) => file.endsWith(".json"));

  assert.ok(files.length > 0, "Expected at least one corpus text JSON file");

  for (const file of files) {
    const filePath = path.join(textsDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(content);

    const parsed = TextDocumentSchema.parse(json);
    assert.ok(parsed.slug, `Expected valid slug in ${file}`);
    assert.ok(parsed.title, `Expected valid title in ${file}`);
    assert.ok(
      Array.isArray(parsed.sentences),
      `Expected sentences array in ${file}`,
    );
  }
});
