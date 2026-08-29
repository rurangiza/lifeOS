"use client";
import { useMDXComponent } from "next-contentlayer/hooks";

export default function MDXContent({
  code,
  components,
}: {
  code: string;
  components: any;
}) {
  const codePrefix = `
  if (typeof process === 'undefined') {
    globalThis.process = { env: {} }
  }
  `;
  const Component = useMDXComponent(codePrefix + code);
  return <Component components={components} />;
}
