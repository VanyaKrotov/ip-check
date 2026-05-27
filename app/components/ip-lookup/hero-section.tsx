import type { i18n as I18nInstance } from "i18next";
import type { FormEvent } from "react";

import { AppHeader } from "~/components/ip-lookup/app-header";
import { HeroCopy } from "~/components/ip-lookup/hero-copy";
import { LookupFormCard } from "~/components/ip-lookup/lookup-form-card";

export function HeroSection({
  i18n,
  input,
  isFetching,
  onInputChange,
  onSubmit,
}: {
  i18n: I18nInstance;
  input: string;
  isFetching: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="border-b bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--secondary))_58%,hsl(var(--accent))_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <AppHeader i18n={i18n} />
        <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <HeroCopy />
          <LookupFormCard
            input={input}
            isFetching={isFetching}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </section>
  );
}
