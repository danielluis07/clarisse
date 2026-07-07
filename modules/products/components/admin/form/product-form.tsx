"use client";

import { useProductSuspense } from "@/modules/products/hooks";
import { ProductFormBody } from "@/modules/products/components/admin/form/product-form-body";

export const ProductForm = ({ id }: { id?: string }) => {
  if (id) return <UpdateProductForm id={id} />;
  return <CreateProductForm />;
};

const CreateProductForm = () => {
  return <ProductFormBody mode="create" />;
};

const UpdateProductForm = ({ id }: { id: string }) => {
  const { data: product } = useProductSuspense({ id });

  return <ProductFormBody mode="update" product={product} />;
};
