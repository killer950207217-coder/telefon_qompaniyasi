/**
 * Smartfonlar katalogi ma'lumotlari
 */

export const PHONES_CATALOG = [
  {
    id: "aura-16-pro-max",
    brand: "AURA",
    name: "Aura 16 Pro Max",
    category: "Flagman",
    basePrice: 15490000,
    image: "/src/assets/images/phone_aura_pro_titanium_1795173507714.jpg",
    shortSpec: '6.9" OLED · 48MP Triple · Titan',
    description:
      "Aerokosmik 5-darajali titan korpus, 120Hz LTPO ProMotion displey va professional 5x optik zoom kamera tizimiga ega eng kuchli flagman.",
    colors: [
      { id: "titanium", name: "Tabiiy Titan", hex: "#9f9a90" },
      { id: "obsidian", name: "Qora Obsidiyan", hex: "#232730" },
      { id: "champagne", name: "Shampan Oltin", hex: "#c9ae77" },
    ],
    storages: [
      { label: "256 GB", delta: 0 },
      { label: "512 GB", delta: 1950000 },
      { label: "1 TB", delta: 3800000 },
    ],
    specs: {
      Displey: '6.9" LTPO OLED, 120Hz',
      Protsessor: "A18 Pro 3nm Neural",
      Kamera: "48MP + 48MP + 12MP (5x Zoom)",
      Batareya: "4685 mAh · 45W tez quvvat",
    },
  },
  {
    id: "galaxy-s25-ultra",
    brand: "GALAXY",
    name: "Galaxy S25 Ultra",
    category: "Flagman",
    basePrice: 14250000,
    image: "/src/assets/images/phone_galaxy_ultra_black_1795173506596.jpg",
    shortSpec: '6.8" Dynamic AMOLED · 200MP · S-Pen',
    description:
      "O'tkir geometrik titan ramka, o'rnatilgan S-Pen stilusi va tungi suratga olishda tengsiz 200 megapikselli asosiy kamera.",
    colors: [
      { id: "obsidian", name: "Qora Obsidiyan", hex: "#232730" },
      { id: "titanium", name: "Tabiiy Titan", hex: "#9f9a90" },
      { id: "cobalt", name: "Kobalt Ko'k", hex: "#2e56a6" },
    ],
    storages: [
      { label: "256 GB", delta: 0 },
      { label: "512 GB", delta: 1650000 },
      { label: "1 TB", delta: 3400000 },
    ],
    specs: {
      Displey: '6.8" QHD+ AMOLED 2X, 120Hz',
      Protsessor: "Snapdragon 8 Elite",
      Kamera: "200MP + 50MP + 50MP + 10MP",
      Batareya: "5000 mAh · 45W SuperCharge",
    },
  },
  {
    id: "zenith-fold-6",
    brand: "ZENITH",
    name: "Zenith Fold 6 Gold",
    category: "Buklanadigan",
    basePrice: 18900000,
    image: "/src/assets/images/phone_zenith_fold_gold_1795173506510.jpg",
    shortSpec: '7.6" Buklanadigan · 12GB RAM · Titan sharnir',
    description:
      "Planshet kengligidagi 7.6 dyuymli ichki AMOLED ekran va mustahkam shampan-oltin titan bukilish mexanizmi bilan birlashtirilgan biznes smartfoni.",
    colors: [
      { id: "champagne", name: "Shampan Oltin", hex: "#c9ae77" },
      { id: "obsidian", name: "Qora Obsidiyan", hex: "#232730" },
    ],
    storages: [
      { label: "256 GB", delta: 0 },
      { label: "512 GB", delta: 2100000 },
    ],
    specs: {
      Displey: '7.6" Katta + 6.3" Tashqi AMOLED',
      Protsessor: "Snapdragon 8 Gen 3 Pro",
      Kamera: "50MP OIS + 12MP + 10MP",
      Batareya: "4400 mAh · Ikki qismli tizim",
    },
  },
  {
    id: "nova-air-prime",
    brand: "AXON",
    name: "Axon Air Prime",
    category: "Yengil",
    basePrice: 8950000,
    image: "/src/assets/images/phone_nova_air_silver_1795173508004.jpg",
    shortSpec: '6.6" OLED · 5.8mm Yupqa · 158g',
    description:
      "Atigi 5.8 mm qalinlikdagi silliqlangan alyuminiy korpus va qo'lda mutlaqo sezilmaydigan yengil muvozanat — kundalik qulaylik ixlosmandlari uchun.",
    colors: [
      { id: "titanium", name: "Kumush Alyuminiy", hex: "#9f9a90" },
      { id: "cobalt", name: "Kobalt Ko'k", hex: "#2e56a6" },
    ],
    storages: [
      { label: "128 GB", delta: 0 },
      { label: "256 GB", delta: 950000 },
      { label: "512 GB", delta: 1900000 },
    ],
    specs: {
      Displey: '6.6" FHD+ OLED, 120Hz',
      Protsessor: "Dimensity 9300+ Ultra",
      Kamera: "50MP Sony IMX890 + 12MP",
      Batareya: "4500 mAh · 67W Tezkor quvvat",
    },
  },
  {
    id: "obsidian-pixel-studio",
    brand: "OBSIDIAN",
    name: "Obsidian Studio 9 Pro",
    category: "Kamerofon",
    basePrice: 12650000,
    image: "/src/assets/images/phone_pixel_studio_cobalt_1795173507433.jpg",
    shortSpec: '6.7" Super Actua · 50MP Visor · 16GB RAM',
    description:
      "Gorizontal metall kamera paneli, tabiiy rang uzatuvchi HDR+ algoritmi va mat kobalt shishali orqa qopqoq bilan bezatilgan kamerofon.",
    colors: [
      { id: "cobalt", name: "Kobalt Ko'k", hex: "#2e56a6" },
      { id: "obsidian", name: "Qora Obsidiyan", hex: "#232730" },
      { id: "titanium", name: "Tabiiy Titan", hex: "#9f9a90" },
    ],
    storages: [
      { label: "128 GB", delta: 0 },
      { label: "256 GB", delta: 1200000 },
      { label: "512 GB", delta: 2450000 },
    ],
    specs: {
      Displey: '6.7" Super Actua OLED, 3000 nit',
      Protsessor: "Tensor G4 Studio Chip",
      Kamera: "50MP Asosiy + 48MP Telefoto 5x",
      Batareya: "5050 mAh · 37W + Simsiz quvvat",
    },
  },
  {
    id: "aura-16-lite",
    brand: "AURA",
    name: "Aura 16 Studio",
    category: "Yengil",
    basePrice: 10990000,
    image: "/src/assets/images/phone_aura_pro_titanium_1795173507714.jpg",
    shortSpec: '6.3" Compact OLED · 48MP · 256GB',
    description:
      "Bir qo'lda boshqarish uchun qulay 6.3 dyuymli ixcham korpus, kuchli protsessor va yuqori aniqlikdagi 4K 60fps video suratga olish imkoniyati.",
    colors: [
      { id: "titanium", name: "Tabiiy Titan", hex: "#9f9a90" },
      { id: "champagne", name: "Shampan Oltin", hex: "#c9ae77" },
      { id: "cobalt", name: "Kobalt Ko'k", hex: "#2e56a6" },
    ],
    storages: [
      { label: "128 GB", delta: 0 },
      { label: "256 GB", delta: 1100000 },
      { label: "512 GB", delta: 2300000 },
    ],
    specs: {
      Displey: '6.3" OLED Super Retina, 120Hz',
      Protsessor: "A18 Bionic Neural",
      Kamera: "48MP Fusion + 12MP UltraWide",
      Batareya: "3980 mAh · MagSafe 25W",
    },
  },
];

export function formatUZS(amount) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
}
