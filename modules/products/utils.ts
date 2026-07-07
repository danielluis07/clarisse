export type VariantStockState = "in_stock" | "low_stock" | "out_of_stock";

export const getVariantStockState = (
  stockQuantity: number,
  lowStockThreshold: number,
): VariantStockState => {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= lowStockThreshold) return "low_stock";
  return "in_stock";
};

export const getProductStatusLabel = (
  status: "draft" | "active" | "archived",
) => {
  const labels = {
    draft: "Rascunho",
    active: "Ativo",
    archived: "Arquivado",
  } as const;

  return labels[status];
};

export const getStockStatusLabel = (status: VariantStockState) => {
  const labels = {
    in_stock: "Em estoque",
    low_stock: "Estoque baixo",
    out_of_stock: "Sem estoque",
  } as const;

  return labels[status];
};

export const buildVariantLabel = ({
  colorName,
  size,
}: {
  colorName: string;
  size: string;
}) => {
  if (colorName === "Default" && size === "One Size") return "Padrão";
  if (size === "One Size") return colorName;
  if (colorName === "Default") return size;
  return `${colorName} / ${size}`;
};

export const normalizeSkuPart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
