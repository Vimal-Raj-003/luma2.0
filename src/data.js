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

// Cumulative share of the *perceived* build (0..1) at each frame. Measured from the footage, then
// weighted so scroll feels purposeful: frames 1-13 (empty glass, drifting droplets) are compressed,
// frames 14-33 (milk drop -> stream -> first splash) get extra room. Scroll maps to this curve, not
// to frame number.
export const FRAME_PATH = [0,0.0006,0.0012,0.0018,0.0024,0.003,0.0036,0.0041,0.0047,0.0053,0.0059,0.0064,0.0074,0.0144,0.0215,0.0294,0.0373,0.0501,0.0593,0.0686,0.078,0.0876,0.1026,0.112,0.1209,0.1301,0.1402,0.1559,0.1665,0.1781,0.191,0.2067,0.2367,0.2462,0.2556,0.265,0.2739,0.289,0.2998,0.311,0.3229,0.3346,0.351,0.3621,0.3725,0.3819,0.39,0.4014,0.4078,0.4135,0.4188,0.4239,0.4317,0.4359,0.4401,0.445,0.4504,0.4605,0.4672,0.4742,0.4813,0.489,0.5031,0.5114,0.5193,0.5276,0.5354,0.5494,0.5591,0.569,0.5794,0.5902,0.6067,0.6182,0.6301,0.6427,0.6556,0.6735,0.6876,0.7017,0.7156,0.7292,0.7473,0.7595,0.7717,0.7836,0.795,0.8105,0.8204,0.8299,0.8389,0.8476,0.8596,0.8675,0.8745,0.8815,0.888,0.8972,0.9025,0.907,0.9113,0.915,0.921,0.9246,0.9286,0.9326,0.9366,0.9441,0.9512,0.9547,0.9584,0.9623,0.9711,0.9758,0.9798,0.9841,0.9876,0.9935,0.9969,1.0]
