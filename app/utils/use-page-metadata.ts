import { useEffect } from "react";

import { metadataDescriptionSelector, socialDescriptionSelectors, socialTitleSelectors } from "~/utils/dom-selectors";

export function usePageMetadata({
  description,
  language,
  title,
}: {
  description: string;
  language: string;
  title: string;
}) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = title;

    const descriptionElement = document.querySelector<HTMLMetaElement>(metadataDescriptionSelector);
    descriptionElement?.setAttribute("content", description);

    socialTitleSelectors.forEach((selector) => {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", title);
    });

    socialDescriptionSelectors.forEach((selector) => {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", description);
    });
  }, [description, language, title]);
}
