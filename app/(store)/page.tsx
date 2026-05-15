import Link from "next/link";

import { Button } from "@/components/ui/button";

const featuredCollections = [
  {
    title: "New season arrivals",
    description:
      "A curated drop of textures, clean silhouettes, and everyday essentials.",
  },
  {
    title: "Best sellers",
    description:
      "The pieces customers keep coming back for, now refreshed with better details.",
  },
  {
    title: "Gift-ready picks",
    description:
      "Easy-to-shop bundles and small luxuries for last-minute surprises.",
  },
];

const storeHighlights = [
  "Free shipping over $75",
  "30-day returns",
  "New drops every Friday",
];

export default function StoreHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--foreground)_10%,transparent)_0%,transparent_32%),radial-gradient(circle_at_top_right,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_28%),linear-gradient(to_bottom,transparent_0%,transparent_72%,color-mix(in_oklch,var(--foreground)_4%,transparent)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
        <header className="mb-12 flex items-center justify-between gap-6 border-b border-border/70 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Clarisse Store
            </p>
            <h1 className="mt-2 text-4xl leading-none sm:text-5xl lg:text-6xl">
              A mock storefront for testing global styles
            </h1>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex">
            <Link href="#collections">Browse collections</Link>
          </Button>
        </header>

        <main className="grid flex-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col justify-between gap-8 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur sm:p-10">
            <div className="max-w-2xl space-y-6">
              <p className="inline-flex w-fit items-center rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Seasonal edit
              </p>

              <div className="space-y-4">
                <h2 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
                  Simple layout, strong typography, and a few button styles.
                </h2>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  This page is intentionally plain enough to spot global CSS
                  changes quickly, while still giving you a real storefront
                  shell to verify spacing, fonts, and button treatments.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#collections">Shop the edit</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="#highlights">See highlights</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#buttons">Button states</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {storeHighlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                  {highlight}
                </div>
              ))}
            </div>
          </section>

          <aside className="grid gap-6">
            <section
              id="buttons"
              className="rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Button test area
              </p>
              <div className="mt-4 grid gap-3">
                <Button className="justify-start">Primary button</Button>
                <Button variant="secondary" className="justify-start">
                  Secondary button
                </Button>
                <Button variant="outline" className="justify-start">
                  Outline button
                </Button>
                <Button variant="ghost" className="justify-start">
                  Ghost button
                </Button>
              </div>
            </section>

            <section
              id="collections"
              className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Collections
                  </p>
                  <h3 className="mt-2 text-2xl">
                    Three cards to test card styling
                  </h3>
                </div>
                <Button variant="outline" size="sm">
                  View all
                </Button>
              </div>

              <div className="grid gap-3">
                {featuredCollections.map((collection, index) => (
                  <article
                    key={collection.title}
                    className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-colors hover:bg-background">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      0{index + 1}
                    </p>
                    <h4 className="mt-2 text-lg">{collection.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {collection.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="highlights"
              className="rounded-3xl border border-border/70 bg-foreground px-6 py-5 text-background shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-background/70">
                Store note
              </p>
              <p className="mt-3 text-lg leading-7">
                This panel flips contrast so you can check how your global
                tokens behave on a dark surface without switching themes.
              </p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
