"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/hooks/cart";
import { useURLFilters } from "@/hooks/use-url-filters";
import type { StoreProductOutput } from "@/modules/products/types";
import { ProductGallery } from "./product-gallery";
import {
  buildStoreProductView,
  buildVariantPriceLabel,
  findVariant,
  getSizeOptionsForColor,
} from "@/modules/products/store-utils";

export const ProductExperience = ({
  product,
}: {
  product: StoreProductOutput;
}) => {
  const view = useMemo(() => buildStoreProductView(product), [product]);

  const searchParams = useSearchParams();
  const { setFilters } = useURLFilters();

  const colorParam = searchParams.get("color");
  const sizeParam = searchParams.get("size");
  const selectedColor =
    view.colors.find((color) => color.slug === colorParam) ??
    view.colors[0] ??
    null;

  const sizeOptions = useMemo(
    () => getSizeOptionsForColor(product, selectedColor?.name ?? ""),
    [product, selectedColor?.name],
  );

  const selectedSize =
    sizeOptions.find(
      (size) => size.label.toLowerCase() === (sizeParam ?? "").toLowerCase(),
    ) ?? null;

  const selectedVariant = findVariant(
    product,
    selectedColor?.name ?? null,
    selectedSize?.label ?? null,
  );

  const priceLabels = buildVariantPriceLabel(product, selectedVariant);

  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const inStockSizes = sizeOptions.filter((size) => size.inStock).length;
  const selectedVariantOutOfStock =
    !!selectedVariant && selectedVariant.stockQuantity <= 0;
  const quantityLimit = selectedVariant
    ? Math.max(1, Math.min(10, selectedVariant.stockQuantity))
    : 10;
  const selectedQuantity = Math.min(quantity, quantityLimit);

  const handleAddToBag = () => {
    if (sizeOptions.length > 1 && !selectedSize) {
      toast.error("Selecione um tamanho para continuar.");
      return;
    }
    if (!selectedVariant) {
      toast.error("Selecione uma variante disponível.");
      return;
    }
    if (selectedVariant.stockQuantity <= 0) {
      toast.error("Esta variante está indisponível.");
      return;
    }

    const imageUrl =
      selectedColor?.imageUrls[0] ??
      view.allImageUrls[0] ??
      product.primaryImage?.mediaAsset.url ??
      null;
    const unitPriceCents = selectedVariant.priceCents ?? product.basePriceCents;
    const compareAtPriceCents =
      selectedVariant.compareAtPriceCents ?? product.compareAtPriceCents;

    addItem(
      {
        productVariantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl,
        imageAlt: `${product.name} — ${selectedVariant.colorName}`,
        sku: selectedVariant.sku,
        colorName: selectedVariant.colorName,
        colorHex: selectedVariant.colorHex,
        size: selectedVariant.size,
        unitPriceCents,
        compareAtPriceCents,
        maxQuantity: selectedVariant.stockQuantity,
      },
      selectedQuantity,
    );
    openCart();

    /*     toast.success("Adicionado à sacola", {
      description: `${product.name} · ${selectedVariant.colorName} · ${selectedVariant.size} · ${selectedQuantity}x`,
    }); */
  };

  if (!selectedColor) {
    return (
      <section className="bg-background">
        <div className="mx-auto max-w-screen-2xl px-6 py-10 md:px-10 md:py-14">
          <p className="text-sm text-foreground/60">
            Produto indisponível no momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <div className="lg:col-span-6">
          <ProductGallery
            key={selectedColor.slug}
            images={
              selectedColor.imageUrls.length > 0
                ? selectedColor.imageUrls
                : view.allImageUrls
            }
            alt={`${product.name} — ${selectedColor.name}`}
          />
        </div>

        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-32">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-foreground/55">
              {view.category && (
                <Link
                  href={view.category.href}
                  className="transition-colors hover:text-foreground">
                  {view.category.name}
                </Link>
              )}
              {view.collection && (
                <>
                  <span className="text-foreground/30">·</span>
                  <Link
                    href={view.collection.href}
                    className="transition-colors hover:text-foreground">
                    {view.collection.name}
                  </Link>
                </>
              )}
            </div>

            <h1 className="mt-5 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl">
              {product.name}
            </h1>
            {view.subtitle && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                {view.subtitle}
              </p>
            )}

            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-heading text-2xl tabular-nums text-foreground">
                {priceLabels.price}
              </span>
              {priceLabels.compareAt && (
                <span className="text-sm tabular-nums text-foreground/45 line-through">
                  {priceLabels.compareAt}
                </span>
              )}
              {priceLabels.compareAt && (
                <span className="ml-1 inline-flex items-center bg-foreground px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-background">
                  Em oferta
                </span>
              )}
            </div>
            {view.installmentLabel && (
              <p className="mt-2 text-[11px] text-foreground/50">
                {view.installmentLabel}
              </p>
            )}

            {view.colors.length > 0 && (
              <div className="mt-10">
                <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                  Cor
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {view.colors.map((color) => {
                    const active = color.slug === selectedColor.slug;
                    return (
                      <button
                        key={color.slug}
                        type="button"
                        onClick={() =>
                          setFilters(
                            { color: color.slug, size: null },
                            { resetPage: false },
                          )
                        }
                        aria-label={`Cor ${color.name}`}
                        aria-pressed={active}
                        className={cn(
                          "group relative size-10 rounded-full border transition-all",
                          active
                            ? "border-foreground"
                            : "border-foreground/15 hover:border-foreground/40",
                        )}>
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{
                            backgroundColor: color.hex ?? "var(--color-muted)",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizeOptions.length > 0 && (
              <div className="mt-10">
                <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/55">
                  Tamanho
                </p>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {sizeOptions.map((size) => {
                    const active =
                      selectedSize?.label.toLowerCase() ===
                      size.label.toLowerCase();
                    const disabled = !size.inStock;
                    return (
                      <button
                        key={size.label}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setFilters({ size: size.label }, { resetPage: false })
                        }
                        aria-pressed={active}
                        className={cn(
                          "relative h-12 border text-[12px] uppercase tracking-[0.18em] transition-colors",
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/15 text-foreground hover:border-foreground",
                          disabled &&
                            "cursor-not-allowed border-foreground/10 text-foreground/35 line-through hover:border-foreground/10",
                        )}>
                        {size.label}
                      </button>
                    );
                  })}
                </div>
                {sizeOptions.length > 1 && !selectedSize && (
                  <p className="mt-3 text-[11px] text-foreground/55">
                    Selecione um tamanho.
                  </p>
                )}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-stretch gap-3">
              <div className="inline-flex items-center border border-foreground/15">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  className="flex size-12 items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:opacity-30"
                  onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
                  disabled={selectedQuantity <= 1}>
                  <Minus className="size-3.5" />
                </button>
                <span className="w-10 text-center text-sm tabular-nums">
                  {selectedQuantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  className="flex size-12 items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:opacity-30"
                  onClick={() =>
                    setQuantity(Math.min(quantityLimit, selectedQuantity + 1))
                  }
                  disabled={selectedQuantity >= quantityLimit}>
                  <Plus className="size-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToBag}
                disabled={selectedVariantOutOfStock}
                className="group order-3 inline-flex h-12 w-full items-center justify-center gap-3 bg-foreground px-5 text-[11px] uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:order-0 sm:flex-1 sm:tracking-[0.25em]">
                <ShoppingBag className="size-4" />
                {selectedVariantOutOfStock
                  ? "Indisponível"
                  : "Adicionar à sacola"}
              </button>

              <button
                type="button"
                aria-label={
                  wishlisted
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
                aria-pressed={wishlisted}
                onClick={() => {
                  setWishlisted((v) => !v);
                  toast(
                    wishlisted
                      ? "Removido dos favoritos"
                      : "Salvo nos favoritos",
                  );
                }}
                className={cn(
                  "flex size-12 items-center justify-center border transition-colors",
                  wishlisted
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/15 text-foreground/70 hover:border-foreground hover:text-foreground",
                )}>
                <Heart className={cn("size-4", wishlisted && "fill-current")} />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] text-foreground/60">
              <span
                className={cn(
                  "inline-flex size-2 rounded-full",
                  inStockSizes > 0 ? "bg-emerald-600" : "bg-foreground/30",
                )}
              />
              {inStockSizes > 0
                ? `Em estoque · ${inStockSizes} ${
                    inStockSizes === 1 ? "tamanho" : "tamanhos"
                  } disponíveis`
                : "Indisponível por enquanto"}
            </div>

            <ul className="mt-8 space-y-3 border-y border-foreground/10 py-6 text-[12px] text-foreground/70">
              <li className="flex items-center gap-3">
                <Truck className="size-4 text-foreground/55" />
                Frete grátis em compras acima de R$ 800
              </li>
              <li className="flex items-center gap-3">
                <Undo2 className="size-4 text-foreground/55" />
                Trocas gratuitas em até 30 dias
              </li>
            </ul>

            <div className="mt-8 space-y-1">
              {view.description && (
                <DetailsBlock title="Descrição">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                    {view.description}
                  </p>
                </DetailsBlock>
              )}

              {(view.material || view.careInstructions) && (
                <DetailsBlock title="Material & Cuidados">
                  <div className="grid gap-6 text-sm text-foreground/75 md:grid-cols-2">
                    {view.material && (
                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                          Composição
                        </p>
                        <p className="whitespace-pre-line">{view.material}</p>
                      </div>
                    )}
                    {view.careInstructions && (
                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-foreground/50">
                          Cuidados
                        </p>
                        <p className="whitespace-pre-line">
                          {view.careInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </DetailsBlock>
              )}

              {view.fit && (
                <DetailsBlock title="Caimento">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                    {view.fit}
                  </p>
                </DetailsBlock>
              )}

              <DetailsBlock title="Entrega & Trocas">
                <ul className="space-y-2 text-sm text-foreground/75">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-px w-4 shrink-0 bg-foreground/30" />
                    Frete grátis em compras acima de R$ 800
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-px w-4 shrink-0 bg-foreground/30" />
                    Entrega em até 5 dias úteis para capitais
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-px w-4 shrink-0 bg-foreground/30" />
                    Trocas gratuitas em até 30 dias
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-px w-4 shrink-0 bg-foreground/30" />
                    Embalagem reutilizável, livre de plástico
                  </li>
                </ul>
              </DetailsBlock>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

type DetailsBlockProps = {
  title: string;
  children: React.ReactNode;
};

const DetailsBlock = ({ title, children }: DetailsBlockProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-foreground/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/80">
          {title}
        </span>
        <span aria-hidden="true" className="relative size-3 text-foreground/55">
          <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
          <span
            className={cn(
              "absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-300",
              open && "scale-y-0",
            )}
          />
        </span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open
            ? "grid-rows-[1fr] pb-6 opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
