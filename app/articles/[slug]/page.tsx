import { getLocalArticleSlugs, getLocalArticleBySlug } from "../../../lib/articles";
import { ArticleClient } from "./article-client";

export async function generateStaticParams() {
  const slugs = getLocalArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const initialArticle = getLocalArticleBySlug(resolvedParams.slug);

  return <ArticleClient slug={resolvedParams.slug} initialArticle={initialArticle} />;
}
