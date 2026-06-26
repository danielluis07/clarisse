import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateCheckout = () => {
  const trpc = useTRPC();
  const router = useRouter();

  return useMutation(
    trpc.checkout.create.mutationOptions({
      onError: (error) => {
        console.error("Error creating checkout:", error);

        if (error.data?.code === "UNAUTHORIZED") {
          toast.error("Você precisa estar logado para finalizar a compra.");
          router.push("/login");
          return;
        }

        toast.error(
          error.message ||
            "Não foi possível iniciar o pagamento. Tente novamente.",
        );
      },
    }),
  );
};
