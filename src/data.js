export const FRAME_COUNT = 120 // /public/hero_frames/ezgif-frame-001..120.jpg
export const frameSrc = (i) =>
  `/hero_frames/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`

// `tint` is a very light wash over the live background, never a solid fill.
export const flavours = [
  { name: 'Strawberry', tint: 'rgba(190, 30, 60, 0.22)', desc: 'Bright, creamy, and naturally fruity.' },
  { name: 'Rose', tint: 'rgba(190, 70, 110, 0.22)', desc: 'Floral, refreshing, and delicately sweet.' },
  { name: 'Mango', tint: 'rgba(210, 120, 10, 0.2)', desc: 'Smooth tropical richness with a fresh finish.' },
  { name: 'Pistachio', tint: 'rgba(90, 140, 60, 0.2)', desc: 'Nutty, creamy, and quietly indulgent.' },
  { name: 'Chocolate', tint: 'rgba(70, 36, 20, 0.28)', desc: 'Deep cocoa richness with a silky finish.' },
  { name: 'Dry Fruit', tint: 'rgba(150, 100, 40, 0.22)', desc: 'A fuller, richer blend with premium nutty notes.' },
]

export const ingredients = [
  { name: 'Jelly', line: 'Soft, jewel-like cubes that add colour and a playful bite.' },
  { name: 'Basil Seeds', line: 'Delicate seeds that bloom into a refreshing, lightly textured layer.' },
  { name: 'Falooda Sev', line: 'Fine vermicelli strands that give the drink its signature body.' },
  { name: 'Fresh Fruit', line: 'Bright, juicy pieces that bring natural freshness to every spoonful.' },
  { name: 'Pistachio', line: 'A subtle nutty finish with rich colour and delicate crunch.' },
  { name: 'Ice Cream', line: 'A smooth, creamy crown that completes the experience.' },
  { name: 'Rose Syrup', line: 'A fragrant, floral sweetness that ties every layer together.' },
]

export const whyLuma = [
  { title: 'Fresh Ingredients', text: 'Selected for flavour, texture, and quality.', tint: 'rgba(60, 14, 30, 0.3)' },
  { title: 'Balanced Layers', text: 'Each layer is built to complement the next.', tint: 'rgba(130, 24, 54, 0.26)' },
  { title: 'Crafted with Care', text: 'Prepared for consistency, freshness, and finish.', tint: 'rgba(120, 60, 20, 0.26)' },
  { title: 'Made to Enjoy', text: 'Comforting, refreshing, and easy to come back to.', tint: 'rgba(60, 20, 50, 0.3)' },
]

export const quotes = [
  { quote: 'Rich without feeling heavy — every layer has its own moment.', name: 'Guest' },
  { quote: 'Fresh, creamy, and beautifully balanced from top to bottom.', name: 'Customer' },
  { quote: 'The kind of dessert drink you want to take your time with.', name: 'LUMA Regular' },
]
