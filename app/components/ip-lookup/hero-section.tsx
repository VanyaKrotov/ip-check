import { AppHeader } from "~/components/ip-lookup/app-header";
import { HeroCopy } from "~/components/ip-lookup/hero-copy";
import { LookupFormCard } from "~/components/ip-lookup/lookup-form-card";

export function HeroSection({
  isFetching,
  defaultIp,
}: {
  defaultIp: string | null;
  isFetching: boolean;
}) {
  return (
    <section className="border-b bg-[linear-gradient(135deg,hsl(var(--background))_0%,hsl(var(--secondary))_58%,hsl(var(--accent))_100%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <AppHeader />
        <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <HeroCopy />
          <LookupFormCard isFetching={isFetching} defaultIp={defaultIp} />
        </div>
      </div>
    </section>
  );
}
