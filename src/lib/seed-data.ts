/** Curated launch dataset — consistent models, real prompts, CDN imagery. */

export const SEED_MODELS = [
  {
    name: "Alex",
    slug: "alex",
    gender: "male" as const,
    description:
      "The signature male muse of the library — sharp jawline, tousled dark hair, cinematic presence. Alex anchors menswear editorials, moody portraits and urban streetwear stories.",
    imageUrl:
      "https://images.pexels.com/photos/36914000/pexels-photo-36914000.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  },
  {
    name: "Emma",
    slug: "emma",
    gender: "female" as const,
    description:
      "The signature female muse — striking bone structure, versatile styling from haute couture to raw street realism. Emma leads fashion editorials, beauty close-ups and night-city narratives.",
    imageUrl:
      "https://images.pexels.com/photos/38290948/pexels-photo-38290948.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  },
];

export const SEED_CATEGORIES = [
  { name: "Fashion", slug: "fashion", description: "Runway-grade styling, couture silhouettes and garment-first compositions." },
  { name: "Editorial", slug: "editorial", description: "Magazine-style stories with art direction, mood and narrative." },
  { name: "Portrait", slug: "portrait", description: "Character-driven faces, dramatic light and intimate framing." },
  { name: "Streetwear", slug: "streetwear", description: "Urban uniforms, city backdrops and youth-culture energy." },
  { name: "Beauty", slug: "beauty", description: "Skin, light and detail — macro-grade beauty photography." },
  { name: "Lifestyle", slug: "lifestyle", description: "Everyday luxury, movement and lived-in moments." },
  { name: "Travel", slug: "travel", description: "Cities after dark, wanderlust frames and cinematic places." },
];

export const SEED_TAGS = [
  "cinematic",
  "editorial",
  "moody",
  "studio-light",
  "street-style",
  "luxury",
  "black-and-white",
  "night-city",
  "natural-light",
  "close-up",
  "film-grain",
  "high-fashion",
  "minimal",
  "golden-hour",
];

type SeedImage = { url: string; alt: string; width: number; height: number; tags: string[] };
type SeedPrompt = {
  title: string;
  slug: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  images: SeedImage[];
};

export const SEED_PROMPTS: SeedPrompt[] = [
  {
    title: "Crimson Studio Authority",
    slug: "crimson-studio-authority",
    model: "alex",
    category: "portrait",
    status: "published",
    featured: true,
    prompt:
      "Cinematic studio portrait of a handsome man with tousled dark hair wearing a deep red bomber jacket, moody low-key lighting, dark charcoal backdrop, sharp jawline, confident direct gaze, shallow depth of field, subtle film grain, editorial photography style, ultra detailed skin texture, 85mm lens look, photorealistic, 8k",
    negativePrompt: "cartoon, illustration, blurry, distorted face, extra fingers, oversaturated, watermark",
    seoTitle: "Crimson Studio Portrait AI Prompt — Moody Menswear Photography",
    seoDescription:
      "Copy the exact prompt behind this moody crimson studio portrait of Alex — low-key lighting, editorial styling and film-grain finish.",
    images: [
      {
        url: "https://images.pexels.com/photos/14630666/pexels-photo-14630666.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Male model in a red jacket under moody studio lighting",
        width: 800,
        height: 1200,
        tags: ["cinematic", "moody", "studio-light", "high-fashion"],
      },
      {
        url: "https://images.pexels.com/photos/29823375/pexels-photo-29823375.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Moody indoor portrait of a man in soft dramatic light",
        width: 800,
        height: 1120,
        tags: ["moody", "cinematic", "film-grain"],
      },
    ],
  },
  {
    title: "Noir Overcoat Mystery",
    slug: "noir-overcoat-mystery",
    model: "alex",
    category: "editorial",
    status: "published",
    featured: true,
    prompt:
      "Mysterious editorial photograph of a stylish man with curly dark hair wearing black sunglasses and a long black wool overcoat, dramatic chiaroscuro lighting, dark background, film-noir atmosphere, confident pose, luxury menswear campaign aesthetic, photorealistic, intricate fabric detail, shallow depth of field",
    seoTitle: "Film-Noir Menswear AI Prompt — Black Overcoat Editorial",
    seoDescription:
      "A film-noir menswear prompt featuring Alex in a black overcoat — chiaroscuro light, luxury campaign mood, copyable prompt.",
    images: [
      {
        url: "https://images.pexels.com/photos/5582090/pexels-photo-5582090.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Fashionable man in black coat and sunglasses in dramatic light",
        width: 800,
        height: 1200,
        tags: ["editorial", "luxury", "moody", "cinematic"],
      },
    ],
  },
  {
    title: "Neon Dusk Silhouette",
    slug: "neon-dusk-silhouette",
    model: "alex",
    category: "streetwear",
    status: "published",
    featured: false,
    prompt:
      "Cinematic silhouette of a young man in streetwear standing in an evening city street, glowing dusk sky, neon signs bokeh in background, dramatic rim lighting, urban atmosphere, shot on 35mm film, teal and orange grade, photorealistic street photography",
    images: [
      {
        url: "https://images.pexels.com/photos/36455649/pexels-photo-36455649.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Silhouette of a man in a dramatic evening city scene",
        width: 800,
        height: 1200,
        tags: ["night-city", "cinematic", "street-style", "film-grain"],
      },
      {
        url: "https://images.pexels.com/photos/2479951/pexels-photo-2479951.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        alt: "Young man in denim jacket walking down a city street",
        width: 940,
        height: 650,
        tags: ["street-style", "natural-light", "minimal"],
      },
    ],
  },
  {
    title: "Red Light Introspection",
    slug: "red-light-introspection",
    model: "alex",
    category: "portrait",
    status: "published",
    featured: false,
    prompt:
      "Intense portrait of a young man lit by dramatic red and green neon light, dark studio, introspective expression, sweat-glow skin detail, cinematic color contrast, editorial beauty lighting, ultra sharp focus on eyes, photorealistic, 8k detail",
    negativePrompt: "flat lighting, overexposed, cartoon, deformed",
    images: [
      {
        url: "https://images.pexels.com/photos/32796345/pexels-photo-32796345.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Portrait of a young man with intense red and green lighting",
        width: 800,
        height: 1200,
        tags: ["cinematic", "close-up", "night-city", "moody"],
      },
      {
        url: "https://images.pexels.com/photos/36913999/pexels-photo-36913999.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Young man in dramatic lighting with introspective expression",
        width: 800,
        height: 1200,
        tags: ["moody", "studio-light", "minimal"],
      },
    ],
  },
  {
    title: "Analog Reporter",
    slug: "analog-reporter",
    model: "alex",
    category: "lifestyle",
    status: "published",
    featured: false,
    prompt:
      "Vintage-inspired portrait of a man in a brown leather jacket holding an analog film camera, warm window light, classic reporter aesthetic, tweed textures, nostalgic 1970s editorial mood, shallow depth of field, photorealistic, detailed leather texture",
    images: [
      {
        url: "https://images.pexels.com/photos/7618388/pexels-photo-7618388.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Man in vintage attire holding an analog camera",
        width: 800,
        height: 1200,
        tags: ["editorial", "golden-hour", "film-grain"],
      },
    ],
  },
  {
    title: "Concrete Crossing",
    slug: "concrete-crossing",
    model: "alex",
    category: "streetwear",
    status: "published",
    featured: false,
    prompt:
      "Full-body street style photograph of a man in layered urban outfit crossing a city zebra crossing, motion energy, overcast daylight, brutalist architecture background, candid fashion week street style, 35mm film aesthetic, photorealistic",
    images: [
      {
        url: "https://images.pexels.com/photos/17459726/pexels-photo-17459726.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        alt: "Man in fashionable attire crossing a city street",
        width: 940,
        height: 650,
        tags: ["street-style", "minimal", "natural-light"],
      },
      {
        url: "https://images.pexels.com/photos/17459731/pexels-photo-17459731.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        alt: "Man in fleece jacket and cap sitting on city steps",
        width: 940,
        height: 650,
        tags: ["street-style", "natural-light"],
      },
    ],
  },
  {
    title: "Scarlet Power Suit",
    slug: "scarlet-power-suit",
    model: "emma",
    category: "fashion",
    status: "published",
    featured: true,
    prompt:
      "High-fashion editorial photograph of an elegant woman in a tailored scarlet red suit holding a fashion magazine, urban backdrop, confident power pose, golden afternoon light, luxury campaign aesthetic, sharp tailoring detail, photorealistic, Vogue cover style, ultra detailed",
    negativePrompt: "blurry, distorted hands, watermark, text artifacts, cartoon",
    seoTitle: "Scarlet Power Suit AI Prompt — High-Fashion Editorial",
    seoDescription:
      "Copy the high-fashion prompt behind Emma's scarlet power suit editorial — tailored styling, urban backdrop, Vogue-grade light.",
    images: [
      {
        url: "https://images.pexels.com/photos/38290948/pexels-photo-38290948.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Model in red suit posing with magazine against urban backdrop",
        width: 800,
        height: 1200,
        tags: ["high-fashion", "editorial", "luxury", "golden-hour"],
      },
      {
        url: "https://images.pexels.com/photos/38290951/pexels-photo-38290951.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Black and white photo of fashionable woman with magazine",
        width: 800,
        height: 1200,
        tags: ["black-and-white", "editorial", "high-fashion", "film-grain"],
      },
    ],
  },
  {
    title: "Monochrome Tailoring",
    slug: "monochrome-tailoring",
    model: "emma",
    category: "editorial",
    status: "published",
    featured: false,
    prompt:
      "Artistic black and white portrait of a fashion model in an oversized tailored suit, dramatic studio lighting, strong shadow play, androgynous elegance, timeless editorial aesthetic, medium format film look, fine art photography, ultra detailed fabric texture",
    images: [
      {
        url: "https://images.pexels.com/photos/987577/pexels-photo-987577.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Black and white portrait of a model in a stylish suit",
        width: 800,
        height: 1200,
        tags: ["black-and-white", "editorial", "studio-light", "minimal"],
      },
      {
        url: "https://images.pexels.com/photos/20387329/pexels-photo-20387329.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Studio portrait of a woman in black suit with confident pose",
        width: 800,
        height: 1200,
        tags: ["studio-light", "high-fashion", "minimal"],
      },
    ],
  },
  {
    title: "Parisian Fur & Beret",
    slug: "parisian-fur-beret",
    model: "emma",
    category: "fashion",
    status: "published",
    featured: false,
    prompt:
      "Elegant portrait of a stylish woman wearing a red beret and luxurious brown fur coat, soft indoor window light, Parisian chic aesthetic, timeless glamour, shallow depth of field, warm color grade, fashion editorial photography, photorealistic",
    images: [
      {
        url: "https://images.pexels.com/photos/10356436/pexels-photo-10356436.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Woman in red beret and fur coat exuding elegance",
        width: 800,
        height: 1200,
        tags: ["luxury", "high-fashion", "golden-hour", "editorial"],
      },
    ],
  },
  {
    title: "Sculpted Light Beauty",
    slug: "sculpted-light-beauty",
    model: "emma",
    category: "beauty",
    status: "published",
    featured: true,
    prompt:
      "Striking beauty close-up of a woman bathed in dramatic sculpted light and shadow, flawless natural skin texture, freckles visible, soft red lip, dark background, chiaroscuro beauty lighting, macro detail, high-end cosmetics campaign, photorealistic, 8k",
    negativePrompt: "plastic skin, over-smoothed, cartoon, blurry eyes",
    seoTitle: "Sculpted Light Beauty AI Prompt — Dramatic Close-Up",
    seoDescription:
      "Copy the beauty prompt behind this sculpted-light close-up of Emma — chiaroscuro lighting, natural skin detail, campaign-grade finish.",
    images: [
      {
        url: "https://images.pexels.com/photos/30899463/pexels-photo-30899463.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Woman bathed in dramatic light and shadow, artistic portrait",
        width: 800,
        height: 1200,
        tags: ["close-up", "cinematic", "moody", "studio-light"],
      },
      {
        url: "https://images.pexels.com/photos/7479645/pexels-photo-7479645.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Close-up of woman with freckles and natural skin",
        width: 800,
        height: 1200,
        tags: ["close-up", "natural-light", "minimal"],
      },
      {
        url: "https://images.pexels.com/photos/34615421/pexels-photo-34615421.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Close-up portrait of a woman with red lipstick",
        width: 800,
        height: 1200,
        tags: ["close-up", "luxury", "studio-light"],
      },
    ],
  },
  {
    title: "Night Metropolis Muse",
    slug: "night-metropolis-muse",
    model: "emma",
    category: "travel",
    status: "published",
    featured: false,
    prompt:
      "Cinematic night photograph of a woman in a chic coat standing before illuminated skyscrapers, city lights bokeh, reflective wet pavement, moody blue-hour atmosphere, travel editorial aesthetic, anamorphic lens flare, photorealistic, ultra detailed",
    images: [
      {
        url: "https://images.pexels.com/photos/38497354/pexels-photo-38497354.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        alt: "Person before illuminated skyscrapers at night",
        width: 940,
        height: 650,
        tags: ["night-city", "cinematic", "editorial"],
      },
      {
        url: "https://images.pexels.com/photos/35654635/pexels-photo-35654635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        alt: "Woman enjoying a night city skyline view",
        width: 940,
        height: 650,
        tags: ["night-city", "natural-light", "minimal"],
      },
    ],
  },
  {
    title: "Corset Atelier Study",
    slug: "corset-atelier-study",
    model: "emma",
    category: "editorial",
    status: "draft",
    featured: false,
    prompt:
      "Fine-art black and white study of a woman in an elegant corset, soft directional studio light, sculptural pose, haute couture atelier mood, timeless elegance, medium format aesthetic, delicate fabric detail, photorealistic",
    images: [
      {
        url: "https://images.pexels.com/photos/39202379/pexels-photo-39202379.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Black and white portrait of a woman in a corset",
        width: 800,
        height: 1200,
        tags: ["black-and-white", "editorial", "studio-light"],
      },
    ],
  },
];
