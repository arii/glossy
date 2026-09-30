import { readFileSync } from "node:fs";

const source = readFileSync("references/Voyages_of_Ohthere_Wulfstan.tex", "utf8");
const data = readFileSync("data/ohthere.ts", "utf8");

const surfaceTokens = [
  "sǣ-d-e",
  "hlāford-e",
  "norþ-mest",
  "bū-d-e",
  "styċċe-mǣl-um",
  "wīc-i-að",
];

const sourceGlosses = [
  String.raw`say-\textsc{pst}-\textsc{ind.3sg}`,
  String.raw`lord-\textsc{dat.sg}`,
  String.raw`north-most.\textsc{adv}`,
  String.raw`dwell-\textsc{pst}-\textsc{sjv.sg}`,
  String.raw`piece-meal-\textsc{dat.pl}`,
  String.raw`camp-\textsc{thm}-\textsc{prs.ind.pl}`,
];

for (const token of [...surfaceTokens, ...sourceGlosses]) {
  if (!source.includes(token)) {
    throw new Error(`Missing expected source token: ${token}`);
  }
  if (!data.includes(token.replaceAll("\\", "\\\\"))) {
    throw new Error(`Data no longer preserves source token: ${token}`);
  }
}

console.log(
  `Validated ${surfaceTokens.length} surface tokens and ${sourceGlosses.length} TeX glosses against ${"references/Voyages_of_Ohthere_Wulfstan.tex"}.`,
);
