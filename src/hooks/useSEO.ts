import { useEffect } from "react";

export function useSEO({
  title,
  description,
  canonicalPath,
}: {
  title: string;
  description?: string;
  canonicalPath?: string;
}) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    if (canonicalPath) {
      let link = document.querySelector('link[rel="canonical"]') as
        | HTMLLinkElement
        | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      const href = canonicalPath.startsWith("http")
        ? canonicalPath
        : `${window.location.origin}${canonicalPath}`;
      link.setAttribute("href", href);
    }
  }, [title, description, canonicalPath]);
}
