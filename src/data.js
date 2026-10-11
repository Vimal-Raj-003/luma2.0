export const FRAME_COUNT = 120 // /public/hero_frames/ezgif-frame-001..120.jpg
export const frameSrc = (i) =>
  `/hero_frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`

export const flavours = [
  {
    name: 'Strawberry',
    bg: '#a81f3d',
    filter: 'none',
    desc: 'Sun-ripened strawberries crushed into a bright, jammy syrup — the classic, in its most radiant form.',
  },
  {
    name: 'Rose',
    bg: '#9c3a60',
    filter: 'hue-rotate(-14deg) saturate(.85) brightness(1.1)',
    desc: 'Fragrant Damask rose syrup over silky milk. Floral, cooling and quietly romantic.',
  },
  {
    name: 'Mango',
    bg: '#b8650a',
    filter: 'hue-rotate(30deg) saturate(1.2) brightness(1.1)',
    desc: 'Alphonso mango pulp folded through every layer. Golden, honeyed and impossibly smooth.',
  },
  {
    name: 'Pistachio',
    bg: '#4f7a3a',
    filter: 'hue-rotate(112deg) saturate(.8) brightness(1.05)',
    desc: 'Roasted pistachio cream with a buttery crunch. Earthy, nutty and deeply satisfying.',
  },
  {
    name: 'Chocolate',
    bg: '#3b2216',
    filter: 'hue-rotate(30deg) saturate(.5) brightness(.62) contrast(1.1)',
    desc: 'Dark cocoa ribbons and fudge sauce through cold milk. Decadent without being heavy.',
  },
  {
    name: 'Dry Fruit',
    bg: '#7d5226',
    filter: 'hue-rotate(38deg) saturate(.7) sepia(.35) brightness(.92)',
    desc: 'Almond, cashew and raisin steeped in saffron milk. A festive, generous layer of richness.',
  },
]

export const ingredients = [
  { id: 'strawberry', name: 'Strawberry', line: 'Hand-picked, sweet, a little tart', d: [64, 30, 24], m: [24, 46, 26] },
  { id: 'jelly', name: 'Jelly', line: 'Glossy cubes that wobble', d: [86, 56, 16], m: [80, 36, 20] },
  { id: 'basil', name: 'Basil seeds', line: 'Cool, silky pearls', d: [53, 68, 15], m: [18, 62, 20] },
  { id: 'sev', name: 'Sev', line: 'Fine vermicelli threads', d: [76, 80, 19], m: [52, 68, 22] },
  { id: 'nuts', name: 'Nuts', line: 'Toasted for crunch', d: [88, 20, 16], m: [84, 60, 20] },
  { id: 'syrup', name: 'Syrup', line: 'Slow-cooked and glossy', d: [52, 26, 14], m: [46, 38, 15] },
  { id: 'icecream', name: 'Ice cream', line: 'One generous scoop', d: [68, 52, 27], m: [58, 52, 30] },
]

export const buildSteps = [
  { name: 'Syrup', desc: 'It starts at the bottom. A glossy ribbon of crimson syrup pools into the glass.' },
  { name: 'Milk', desc: 'Chilled, creamy milk is poured over — soft, cold and lightly sweet.' },
  { name: 'Jelly', desc: 'Jewel-bright jelly cubes tumble through, each one a little burst of fruit.' },
  { name: 'Basil seeds', desc: 'Silky basil seeds settle in. Cooling, with a gentle pop.' },
  { name: 'Sev', desc: 'Fine falooda sev is nested on top, adding that unmistakable slurp.' },
  { name: 'Ice cream', desc: 'A generous scoop crowns the glass, melting into every layer beneath it.' },
  { name: 'Toppings', desc: 'Fresh strawberries, crushed pistachio and a final drizzle. Ready to enjoy.' },
]

export const whyLuma = [
  {
    word: 'FRESH',
    title: ['Fresh', 'Ingredients'],
    text: 'Fruit chosen the morning it is used. Milk that is genuinely cold. Nothing from a packet, nothing hidden.',
    bg: '#2a0f16',
    img: '/images/fresh.jpg',
    pos: '50% 50%',
  },
  {
    word: 'RICH',
    title: ['Rich', 'Layers'],
    text: 'Syrup, jelly, seeds, sev and cream, stacked so every spoonful has a different texture.',
    bg: '#8e1f3a',
    img: '/images/layers.jpg',
    pos: '50% 50%',
  },
  {
    word: 'CARE',
    title: ['Crafted', 'with Care'],
    text: 'Each glass is built by hand, layer by layer, in the same order every time — because details matter.',
    bg: '#a2561a',
    img: '/images/care.jpg',
    pos: '50% 50%',
  },
  {
    word: 'MOOD',
    title: ['Made for', 'Every Mood'],
    text: 'Celebrating, cooling off or simply treating yourself. Six flavours for whatever kind of day it is.',
    bg: '#3d5a2c',
    img: '/images/mood.jpg',
    pos: '40% 50%',
  },
]

export const testimonials = [
  { quote: 'The first spoonful honestly stopped the conversation at our table. Every layer tastes different.', name: 'Aisha K.', role: 'Strawberry lover', img: '/images/care.jpg', pos: '50% 30%' },
  { quote: 'Rose Falooda like my grandmother made — but somehow lighter. I went back the next evening.', name: 'Rohan M.', role: 'Weekend regular' },
  { quote: 'It looks like a painting and tastes even better. The mango one is dangerously good.', name: 'Priya S.', role: 'Mango devotee', img: '/images/layers.jpg', pos: '50% 60%' },
  { quote: 'Cold, creamy, crunchy, chewy. Everything a dessert should be, all in one glass.', name: 'Daniel R.', role: 'First-timer, now a fan' },
  { quote: 'We ordered for a family gathering and the whole table asked where it was from.', name: 'Meera N.', role: 'Hosting season', img: '/images/fresh.jpg', pos: '45% 50%' },
  { quote: 'Pistachio is my forever order. Nutty, fresh and never too sweet.', name: 'Sam T.', role: 'Pistachio purist' },
]
