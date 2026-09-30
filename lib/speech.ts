const pronunciationReplacements: Array<[RegExp, string]> = [
  [/sċ/g, "sh"],
  [/ċ/g, "ch"],
  [/ġ/g, "y"],
  [/þ/g, "th"],
  [/ð/g, "th"],
  [/ǣ/g, "ae"],
  [/æ/g, "a"],
  [/ā/g, "aa"],
  [/ē/g, "ee"],
  [/ī/g, "ee"],
  [/ō/g, "oh"],
  [/ū/g, "oo"],
  [/ȳ/g, "ee"],
];

export function toBrowserSpeechText(text: string) {
  return pronunciationReplacements
    .reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text)
    .replaceAll("-", "")
    .replace(/Ō/g, "oh")
    .replace(/Æ/g, "ae")
    .replace(/\s+/g, " ")
    .trim();
}
