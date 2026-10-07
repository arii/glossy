import prettier from "prettier";

export async function formatJson(content, filepath) {
  const options = await prettier.resolveConfig(filepath);
  return prettier.format(content, {
    ...options,
    filepath,
  });
}
