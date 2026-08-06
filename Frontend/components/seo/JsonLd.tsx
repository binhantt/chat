type Props = {
  data: Record<string, unknown>;
};

/**
 * Renders JSON-LD structured data inside the <body>.
 * Next.js will hoist <script> tags to <head> automatically.
 */
export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
