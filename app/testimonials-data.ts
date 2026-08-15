export type ClientTestimonial = {
  id: string;
  pullQuote: string;
  fullQuote: string;
  name: string;
  role: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null;
};

export const clientTestimonials: ClientTestimonial[] = [
  {
    id: "megan-o-moran",
    pullQuote: "He goes above and beyond to deliver an incredible product every time.",
    fullQuote: "Sarthak is an absolute pleasure to work with. He is efficient, devoted, talented, and extremely responsive. He truly takes the time to understand the scope of his work and goes above and beyond to deliver an incredible product every time. I would recommend Sarthak to anybody seeking content creation, video editing, animation work, and related creative endeavors.",
    name: "MEGAN O MORAN",
    role: "Co-Founder · Zimo Media",
    image: {
      src: "/testimonials/megan-o-moran.webp",
      alt: "Megan O Moran",
      width: 1080,
      height: 1350,
    },
  },
  {
    id: "pradeep-chintapalli",
    pullQuote: "Your product is in very good hands as long as he is working on it.",
    fullQuote: "Sarthak is very competent with editing videos as per your requirement. His skills and creativity are really good. Most importantly for me, he can also improvise and use his creativity to make your project even better. I would suggest hiring him all day long. Your product is in very good hands as long as he is working on it.",
    name: "PRADEEP CHINTAPALLI",
    role: "YouTube Channel · Video Editing",
    image: null,
  },
];
