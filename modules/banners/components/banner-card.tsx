"use client";

import { Edit, ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  bannerPlacementLabels,
  bannerStatusLabels,
} from "@/modules/banners/constants";
import type { BannerOutput } from "@/modules/banners/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const getStatusVariant = (
  status: BannerOutput["status"],
): ComponentProps<typeof Badge>["variant"] => {
  if (status === "active") return "default";
  if (status === "archived") return "outline";
  return "secondary";
};

export const BannerCard = ({
  banner,
  selected,
  onSelectedChange,
  onDelete,
}: {
  banner: BannerOutput;
  selected: boolean;
  onSelectedChange: (checked: boolean) => void;
  onDelete: () => void;
}) => {
  const image = banner.image ?? banner.mobileImage;
  const createdAt =
    banner.createdAt instanceof Date
      ? banner.createdAt
      : new Date(banner.createdAt);

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-sm",
        selected && "ring-2 ring-primary/40",
      )}>
      <CardHeader>
        <CardTitle className="min-w-0">
          <Link
            href={`/admin/banners/${banner.id}`}
            className="block truncate hover:underline font-admin">
            {banner.title}
          </Link>
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelectedChange(checked === true)}
            aria-label={`Selecionar ${banner.title}`}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? banner.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStatusVariant(banner.status)}>
            {bannerStatusLabels[banner.status]}
          </Badge>
          <Badge variant="outline">
            {bannerPlacementLabels[banner.placement]}
          </Badge>
        </div>

        <div className="flex min-h-16 flex-col gap-1">
          {banner.subtitle && (
            <p className="truncate text-sm font-medium">{banner.subtitle}</p>
          )}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {banner.description || "Sem descrição editorial."}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">CTA</dt>
            <dd className="truncate font-medium">
              {banner.ctaLabel || "Não definido"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground">Criado em</dt>
            <dd className="font-medium">
              {format(createdAt, "dd/MM/yyyy", { locale: ptBR })}
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/banners/${banner.id}`}>
            <Edit data-icon="inline-start" />
            Editar
          </Link>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}>
          <Trash2 data-icon="inline-start" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
};
