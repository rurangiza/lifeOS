import { defineDocumentType, makeSource } from "contentlayer/source-files"
import rehypePrettyCode from "rehype-pretty-code"
import { rehypePrettyCodeOptions } from "./.lib/rehypePrettyCode"
import { transformerCopyButton } from '@rehype-pretty/transformers'

const Post = defineDocumentType(() => ({
  name: "Post",
  contentType: "mdx",
  filePathPattern: "**/*.mdx",
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    published: { type: 'boolean', required: true }
  },
  computedFields: {
    url: { type: 'string', resolve: (post) => `/posts/${post._raw.flattenedPath}` },
  },
}))
 
export default makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
  mdx: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        rehypePrettyCodeOptions,
        transformerCopyButton
      ]
    ],
  },
})