import { db } from "@/db";
import { customers } from "@/db/schema";

type CustomerSeed = {
  name: string;
  email: string;
  phone?: string;
  acceptsMarketing?: boolean;
  ordersCount?: number;
  totalSpentCents?: number;
};

const customerSeeds: CustomerSeed[] = [
  {
    name: "Alice Montenegro",
    email: "alice.montenegro@example.com",
    phone: "5511988011201",
    acceptsMarketing: true,
    ordersCount: 4,
    totalSpentCents: 48200,
  },
  {
    name: "Bianca Siqueira",
    email: "bianca.siqueira@example.com",
    phone: "5521988021202",
    acceptsMarketing: false,
    ordersCount: 1,
    totalSpentCents: 12600,
  },
  {
    name: "Camila Valente",
    email: "camila.valente@example.com",
    phone: "5531988031203",
    acceptsMarketing: true,
    ordersCount: 7,
    totalSpentCents: 91400,
  },
  {
    name: "Daniela Azevedo",
    email: "daniela.azevedo@example.com",
    phone: "5541988041204",
    acceptsMarketing: true,
    ordersCount: 2,
    totalSpentCents: 23800,
  },
  {
    name: "Elisa Moreira",
    email: "elisa.moreira@example.com",
    phone: "5551988051205",
    acceptsMarketing: false,
    ordersCount: 0,
    totalSpentCents: 0,
  },
  {
    name: "Fernanda Ribeiro",
    email: "fernanda.ribeiro@example.com",
    phone: "5561988061206",
    acceptsMarketing: true,
    ordersCount: 5,
    totalSpentCents: 65700,
  },
  {
    name: "Gabriela Fonseca",
    email: "gabriela.fonseca@example.com",
    phone: "5571988071207",
    acceptsMarketing: false,
    ordersCount: 3,
    totalSpentCents: 32900,
  },
  {
    name: "Helena Prado",
    email: "helena.prado@example.com",
    phone: "5581988081208",
    acceptsMarketing: true,
    ordersCount: 6,
    totalSpentCents: 80400,
  },
  {
    name: "Isabela Nogueira",
    email: "isabela.nogueira@example.com",
    phone: "5511988091209",
    acceptsMarketing: true,
    ordersCount: 9,
    totalSpentCents: 109500,
  },
  {
    name: "Juliana Paes",
    email: "juliana.paes@example.com",
    phone: "5521988101210",
    acceptsMarketing: false,
    ordersCount: 1,
    totalSpentCents: 17900,
  },
  {
    name: "Larissa Campos",
    email: "larissa.campos@example.com",
    phone: "5531988111211",
    acceptsMarketing: true,
    ordersCount: 8,
    totalSpentCents: 98800,
  },
  {
    name: "Mariana Tavares",
    email: "mariana.tavares@example.com",
    phone: "5541988121212",
    acceptsMarketing: false,
    ordersCount: 2,
    totalSpentCents: 21400,
  },
  {
    name: "Natália Duarte",
    email: "natalia.duarte@example.com",
    phone: "5551988131213",
    acceptsMarketing: true,
    ordersCount: 10,
    totalSpentCents: 126300,
  },
  {
    name: "Olivia Barros",
    email: "olivia.barros@example.com",
    phone: "5561988141214",
    acceptsMarketing: false,
    ordersCount: 0,
    totalSpentCents: 0,
  },
  {
    name: "Patrícia Lima",
    email: "patricia.lima@example.com",
    phone: "5571988151215",
    acceptsMarketing: true,
    ordersCount: 3,
    totalSpentCents: 41500,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed customers");
  }

  const rows = customerSeeds.map((customer) => ({
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? null,
    acceptsMarketing: customer.acceptsMarketing ?? false,
    ordersCount: customer.ordersCount ?? 0,
    totalSpentCents: customer.totalSpentCents ?? 0,
  }));

  await db
    .insert(customers)
    .values(rows)
    .onConflictDoNothing({ target: customers.email });

  console.log(`Seeded ${rows.length} customers`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
