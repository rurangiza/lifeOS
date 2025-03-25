// contentlayer.config.js
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypePrettyCode from "rehype-pretty-code";

// .lib/rehypePrettyCode.ts
var rehypePrettyCodeOptions = {
  // prepackaged theme: https://shiki.style/themes#themes
  theme: "material-theme-lighter"
  // or import a custom theme
  // theme: JSON.parse(vercelLightTheme),
};

// contentlayer.config.js
import { transformerCopyButton } from "@rehype-pretty/transformers";
var Post = defineDocumentType(() => ({
  name: "Post",
  contentType: "mdx",
  filePathPattern: "**/*.mdx",
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true }
  },
  computedFields: {
    url: { type: "string", resolve: (post) => `/posts/${post._raw.flattenedPath}` }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
  mdx: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        rehypePrettyCodeOptions,
        transformerCopyButton
      ]
    ]
  }
});
export {
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-EKPCQEFX.mjs.map
