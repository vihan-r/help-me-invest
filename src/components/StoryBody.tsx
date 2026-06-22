import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";

/**
 * Renders an investor story's rich-text body using the brand type scale —
 * portable-text blocks map onto the same classes the rest of the site uses, so
 * editorial copy stays on-brand without exposing any styling controls.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="body col-reading mt-5">{children}</p>,
    h2: ({ children }) => <h2 className="h2 col-display mt-12">{children}</h2>,
    h3: ({ children }) => <h3 className="h3 col-display mt-10">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="body-large col-reading mt-8">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="body col-reading mt-5 list-disc pl-6">{children}</ul>,
    number: ({ children }) => (
      <ol className="body col-reading mt-5 list-decimal pl-6">{children}</ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      return (
        <a className="tertiary-link" href={href}>
          {children}
        </a>
      );
    },
  },
};

export function StoryBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
