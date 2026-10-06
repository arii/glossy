export type PartOfSpeech =
  | "adjective"
  | "adverb"
  | "noun"
  | "verb"
  | "pronoun"
  | "determiner"
  | "numeral"
  | "preposition"
  | "conjunction"
  | "interjection";

export type InflectionFeatures = {
  case?: "nominative" | "accusative" | "genitive" | "dative" | "instrumental";
  number?: "singular" | "plural" | "dual";
  gender?: "masculine" | "feminine" | "neuter";
  person?: 1 | 2 | 3;
  tense?: "present" | "past";
  mood?: "indicative" | "subjunctive" | "imperative" | "infinitive";
  degree?: "positive" | "comparative" | "superlative";
  declension?: "strong" | "weak";
  voice?: "active" | "passive";
};

export type Morpheme = {
  id?: string;
  form: string;
  gloss: string;
  kind?: "stem" | "prefix" | "suffix" | "ending";
};

export type SourceReference = {
  file: string;
  locator: string;
};

export type ReviewMetadata = {
  status: "source-checked" | "needs-review";
  source: SourceReference;
  notes?: string;
};

export type LinguisticAnalysis = {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  features: InflectionFeatures;
  morphemes: Morpheme[];
  definition: string;
  phonetic?: string;
  pronunciationSource?: string;
  historicalNote?: string;
  wiktionaryUrl?: string;
};

export type LexiconEntry = {
  lemma: string;
  pos: PartOfSpeech;
  wiktionaryUrl: string;
  definition?: string;
  ipa?: string;
};

export type InterlinearWord = {
  id: string;
  originalWord: string;
  morphologicalGloss?: string;
  trailingPunctuation?: string;
  sourceGlossTex?: string;
  analysis?: LinguisticAnalysis;
  review?: ReviewMetadata;
};

export type ReadingSentence = {
  id: string;
  translation: string;
  footnotes?: string[];
  words: InterlinearWord[];
};

export type PassageSegment =
  | { type: "text"; value: string }
  | { type: "gloss"; value: string; glossId: string };

export type PassageBlock = {
  id: string;
  segments: PassageSegment[];
  translation: string;
};

export type Passage = {
  title: string;
  source: string;
  blocks: PassageBlock[];
};

export type TextDocument = Passage & {
  textId: string;
  slug: string;
  language: "Old English";
  author?: string;
  date?: string;
  title: string;
  source: string;
  sourceFile: string;
  sourceEdition?: string;
  status: "draft" | "review" | "published";
  sentences?: ReadingSentence[];
  blocks?: PassageBlock[];
  glossRecords?: GlossRecord[];
};

export type GlossRecord = {
  id: string;
  surface: string;
  sourceGloss: string;
  sourceGlossTex: string;
  analysis: LinguisticAnalysis;
  review: ReviewMetadata;
};

export type PassageDocument = TextDocument;

export type DictionaryMorpheme = {
  part: string;
  meaning: string;
};

export type DictionaryEntry = {
  id?: string;
  word: string;
  lemma?: string;
  pos?: PartOfSpeech;
  pronunciation?: string;
  sourceGloss?: string;
  morphemes?: DictionaryMorpheme[];
  inflection?: string;
  definition?: string;
  wiktionaryUrl?: string;
  relativePath?: string;
};

export type ManuscriptSentenceBlock = {
  id: string;
  body: unknown;
  translation?: string;
};

export type ManuscriptDocument = {
  slug: string;
  title: string;
  author?: string;
  source?: string;
  translation?: string;
  blocks?: ManuscriptSentenceBlock[];
  body: unknown;
  rawBody?: string;
  _tina_metadata?: Record<string, string>;
};

export type HomePageContent = {
  pageId?: string;
  title?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export type IngestPageContent = {
  pageId?: string;
  title?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
};

export type AboutPageCapability = {
  title: string;
  description: string;
};

export type AboutPageContent = {
  pageId?: string;
  title?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  missionTitle?: string;
  missionText?: string;
  missionText2?: string;
  capabilitiesTitle?: string;
  capabilities?: AboutPageCapability[];
  maintainersTitle?: string;
  maintainerAriel?: string;
  maintainerTyler?: string;
  maintainerLicense?: string;
  architectureTitle?: string;
  architectureItems?: string[];
};

export type PrivacySectionItem = {
  num?: string;
  title: string;
  content?: string;
  bullets?: string[];
};

export type PrivacyPageContent = {
  pageId?: string;
  title?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  privacySummaryTitle?: string;
  privacySummaryText?: string;
  privacySections?: PrivacySectionItem[];
};

export type AttributionPageContent = {
  pageId?: string;
  title?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  platformCreator?: string;
  platformCreatorUrl?: string;
  defaultEditor?: string;
  defaultEditorUrl?: string;
  editionDate?: string;
  booktitle?: string;
  linguisticPackage?: string;
  standardsTitle?: string;
  standardsStatement?: string;
  bibtexTemplate?: string;
  unifiedTemplate?: string;
  apaTemplate?: string;
  chicagoTemplate?: string;
};

export type DocsDomain = "all" | "linguistics" | "architecture";

export type GlossingAbbreviationItem = {
  abbr: string;
  name: string;
  desc: string;
  category: "Person & Number" | "Case" | "Gender & Mood" | "Part of Speech" | "Affixes & Morphemes";
};

export type DocSectionItem = {
  id: string;
  domain?: "linguistics" | "architecture";
  domainNum?: string;
  num: string;
  eyebrow?: string;
  title: string;
  badge?: string;
};

export type NumeralCardItem = {
  badge: string;
  title: string;
  description: string;
  isFullWidth?: boolean;
};

export type VerificationToolItem = {
  name: string;
  command: string;
  target: string;
};

export type IngestionStepItem = {
  num: string;
  title: string;
  description: string;
};

export type WiktionaryGuidelineItem = {
  title: string;
  description: string;
};

export type IpaSpecificationItem = {
  title: string;
  description: string;
};

export type StorageTierItem = {
  tier: string;
  timing: string;
  title: string;
  description: string;
};

export type DocsPageContent = {
  title?: string;
  eyebrow?: string;
  description?: string;
  canonicalRuleTitle?: string;
  canonicalRuleDescription?: string;
  architectureSpecTitle?: string;
  architectureSpecDescription?: string;
  sections?: DocSectionItem[];
  abbreviations?: GlossingAbbreviationItem[];
  numeralCards?: NumeralCardItem[];
  verificationTools?: VerificationToolItem[];
  ingestionSteps?: IngestionStepItem[];
  wiktionaryGuidelines?: WiktionaryGuidelineItem[];
  ipaSpecifications?: IpaSpecificationItem[];
  storageTiers?: StorageTierItem[];
};

