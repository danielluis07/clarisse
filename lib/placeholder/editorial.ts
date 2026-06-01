/**
 * Placeholder editorial content (the storefront "magazine"). Body is modelled
 * as a small block list so the article layout can render rich content without a
 * CMS yet.
 */
export type EditorialBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export type PlaceholderEditorial = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  author: string;
  date: string;
  readingTime: string;
  body: EditorialBlock[];
  featured?: boolean;
};

export const placeholderEditorials: PlaceholderEditorial[] = [
  {
    slug: "vestir-se-devagar",
    title: "Vestir-se devagar",
    category: "Manifesto",
    excerpt:
      "Um ensaio sobre peças que acompanham o corpo sem pressa: camadas leves, tons neutros e silhuetas pensadas para durar.",
    cover:
      "https://images.unsplash.com/photo-1635693056259-c6e95113dbee?q=80&w=2000&auto=format&fit=crop",
    coverAlt: "Campanha editorial Clarisse — vestir-se devagar",
    author: "Clarisse Studio",
    date: "12 de maio, 2026",
    readingTime: "6 min de leitura",
    featured: true,
    body: [
      {
        type: "paragraph",
        text: "Há uma elegância particular em escolher devagar. Não a pressa do que está em alta, mas o tempo de entender o que realmente acompanha o corpo, a rotina e quem se é. Vestir-se devagar é, antes de tudo, um gesto de atenção.",
      },
      {
        type: "paragraph",
        text: "Nesta estação, partimos de uma pergunta simples: o que permanece quando a temporada passa? A resposta apareceu em camadas leves, tons neutros e silhuetas que não competem com quem as veste. Peças que se somam em vez de gritar.",
      },
      {
        type: "quote",
        text: "Roupa boa não pede para ser notada. Ela espera ser usada — outra vez, e outra, até virar parte do gesto.",
        cite: "Clarisse Studio",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
        alt: "Detalhe de tecido em tom neutro sob luz natural",
        caption: "Lã fria em tom areia — o ponto de partida da paleta.",
      },
      {
        type: "heading",
        text: "O essencial, revisitado",
      },
      {
        type: "paragraph",
        text: "A camisa oversized, a calça de alfaiataria, o tricô de merino. Cada peça foi pensada para conversar com as demais, criando combinações que se renovam sem precisar recomeçar do zero a cada manhã.",
      },
      {
        type: "paragraph",
        text: "É um convite a comprar menos e melhor — a construir um guarda-roupa que dura muito além das estações, acompanhando a mulher que escolhe com intenção.",
      },
    ],
  },
  {
    slug: "a-arte-da-alfaiataria",
    title: "A arte da alfaiataria",
    category: "Bastidores",
    excerpt:
      "Da escolha do tecido ao último ponto à mão: como nasce um blazer que veste por anos.",
    cover:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2000&auto=format&fit=crop",
    coverAlt: "Detalhe de blazer de alfaiataria sobre manequim",
    author: "Atelier Clarisse",
    date: "28 de abril, 2026",
    readingTime: "5 min de leitura",
    body: [
      {
        type: "paragraph",
        text: "Um bom blazer começa muito antes da costura. Começa na escolha da lã, no peso do tecido, na forma como ele cai sobre o ombro. É aí que mora a diferença entre uma peça de estação e uma peça de anos.",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1600&auto=format&fit=crop",
        alt: "Mãos ajustando a lapela de um blazer",
        caption: "O ajuste da lapela, feito à mão.",
      },
      {
        type: "paragraph",
        text: "No nosso atelier, cada blazer passa por etapas que poucas vezes aparecem na vitrine: a entretela costurada, a manga montada com folga para o movimento, o forro respirável. Detalhes invisíveis que o corpo reconhece.",
      },
    ],
  },
  {
    slug: "uma-paleta-para-o-inverno",
    title: "Uma paleta para o inverno",
    category: "Styling",
    excerpt:
      "Areia, marfim, caramelo e preto: como construir looks de inverno com tons que se somam.",
    cover:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=2000&auto=format&fit=crop",
    coverAlt: "Composição de peças em paleta neutra de inverno",
    author: "Clarisse Studio",
    date: "10 de abril, 2026",
    readingTime: "4 min de leitura",
    body: [
      {
        type: "paragraph",
        text: "Inverno não precisa significar escuridão. Uma paleta neutra bem calibrada — areia, marfim, caramelo e preto — abre infinitas combinações sem nunca soar repetitiva.",
      },
      {
        type: "paragraph",
        text: "O segredo está em variar texturas dentro de uma mesma família de cor: a lã, o cetim, o algodão pesado. O olho percebe profundidade onde a paleta permanece silenciosa.",
      },
    ],
  },
  {
    slug: "cuidar-para-durar",
    title: "Cuidar para durar",
    category: "Guia",
    excerpt:
      "Pequenos rituais que prolongam a vida das suas peças favoritas — e por que eles importam.",
    cover:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000&auto=format&fit=crop",
    coverAlt: "Tricô de lã dobrado com cuidado",
    author: "Atelier Clarisse",
    date: "22 de março, 2026",
    readingTime: "3 min de leitura",
    body: [
      {
        type: "paragraph",
        text: "A durabilidade de uma peça não termina na confecção — ela continua em casa. Guardar a malha dobrada, arejar a alfaiataria entre os usos, lavar com parcimônia: gestos simples que fazem a roupa durar mais.",
      },
      {
        type: "quote",
        text: "Cuidar de uma peça é uma forma de continuar a escolhê-la, todos os dias.",
      },
    ],
  },
];

export const getEditorials = () => placeholderEditorials;

export const getFeaturedEditorial = () =>
  placeholderEditorials.find((story) => story.featured) ??
  placeholderEditorials[0];

export const getEditorialBySlug = (slug: string) =>
  placeholderEditorials.find((story) => story.slug === slug);

export const getRelatedEditorials = (slug: string, limit = 3) =>
  placeholderEditorials.filter((story) => story.slug !== slug).slice(0, limit);
