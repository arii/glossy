import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface LocalArticle {
  slug: string;
  title: string;
  author?: string | null;
  date?: string | null;
  coverImage?: string | null;
  summary?: string | null;
  content: string;
}

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export function getLocalArticleSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getLocalArticleBySlug(slug: string): LocalArticle | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: String(data.title || slug),
    author: data.author ? String(data.author) : null,
    date: data.date ? String(data.date) : null,
    coverImage: data.coverImage ? String(data.coverImage) : null,
    summary: data.summary ? String(data.summary) : null,
    content,
  };
}

export function getAllLocalArticles(): LocalArticle[] {
  const slugs = getLocalArticleSlugs();
  return slugs
    .map((slug) => getLocalArticleBySlug(slug))
    .filter((art): art is LocalArticle => art !== null);
}
