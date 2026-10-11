// Stylised ingredient illustrations (viewBox 0 0 120 120). Pure SVG, no filters.

const seedDots = [
  [48, 52], [58, 48], [70, 54], [78, 62], [44, 66], [56, 64], [68, 70], [80, 76],
  [50, 80], [62, 82], [74, 88], [42, 78], [56, 94], [68, 98], [38, 56], [84, 52],
]

export function Strawberry() {
  const seeds = [
    [44, 56], [60, 52], [76, 56], [38, 72], [54, 70], [70, 70], [84, 72],
    [46, 88], [62, 86], [78, 88], [54, 102], [70, 102],
  ]
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="a-sb" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#ff6b7a" />
          <stop offset=".55" stopColor="#e5233f" />
          <stop offset="1" stopColor="#a0102a" />
        </radialGradient>
      </defs>
      <path d="M60 28C86 20 106 38 100 66C94 92 72 110 60 112C48 110 26 92 20 66C14 38 34 20 60 28Z" fill="url(#a-sb)" />
      {seeds.map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2" ry="3" fill="#ffd98a" transform={`rotate(${(i % 3) * 20 - 20} ${x} ${y})`} />
      ))}
      <path d="M60 30C48 14 34 20 28 24C40 24 44 32 46 36C38 36 32 40 30 46C44 40 52 38 60 38C68 38 76 40 90 46C88 40 82 36 74 36C76 32 80 24 92 24C86 20 72 14 60 30Z" fill="#3d9a4a" />
      <path d="M60 30C58 20 60 12 64 8" stroke="#2c7a38" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="42" cy="50" rx="7" ry="12" fill="#fff" opacity=".22" transform="rotate(25 42 50)" />
    </svg>
  )
}

export function Jelly() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <polygon points="60,16 104,38 60,60 16,38" fill="#ff5a6e" />
      <polygon points="16,38 60,60 60,108 16,84" fill="#c21d3a" />
      <polygon points="104,38 60,60 60,108 104,84" fill="#8f1029" />
      <polygon points="60,16 104,38 60,60 16,38" fill="#fff" opacity=".18" />
      <polygon points="26,46 40,53 40,80 26,73" fill="#fff" opacity=".28" />
      <circle cx="78" cy="34" r="5" fill="#fff" opacity=".4" />
    </svg>
  )
}

export function Basil() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="64" r="44" fill="#f1fbff" opacity=".16" />
      {seedDots.map(([x, y], i) => (
        <g key={i} transform={`rotate(${i * 37} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="7.5" ry="6" fill="#e9f6ff" opacity=".38" />
          <ellipse cx={x} cy={y} rx="4" ry="3" fill="#15100f" />
          <ellipse cx={x - 1} cy={y - 1} rx="1.2" ry=".8" fill="#fff" opacity=".6" />
        </g>
      ))}
    </svg>
  )
}

export function Sev() {
  const strands = [
    'M14 30C40 10 60 50 86 28C98 18 104 24 108 30',
    'M10 46C36 26 62 66 90 44C100 36 108 40 112 46',
    'M14 62C40 42 62 82 88 60C100 50 106 56 108 62',
    'M12 78C38 58 60 98 90 76C100 68 106 72 110 78',
    'M16 94C40 74 64 112 88 92C98 84 104 88 106 94',
    'M20 22C44 42 70 8 96 30',
    'M18 108C44 90 66 118 98 104',
  ]
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      {strands.map((d, i) => (
        <path key={i} d={d} stroke={i % 2 ? '#fff0d8' : '#ffe2b8'} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      ))}
    </svg>
  )
}

export function Nuts() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <g transform="rotate(-25 40 60)">
        <path d="M40 22C62 22 72 46 66 70C62 90 46 100 40 100C34 100 18 90 14 70C8 46 18 22 40 22Z" fill="#d6a46a" />
        <path d="M40 24C46 44 46 78 40 98" stroke="#a97a3f" strokeWidth="3" fill="none" />
        <ellipse cx="28" cy="44" rx="4" ry="9" fill="#fff" opacity=".25" />
      </g>
      <g transform="rotate(30 84 70)">
        <path d="M84 36C104 40 110 66 100 86C94 98 76 104 68 96C58 86 62 50 84 36Z" fill="#a4c26a" />
        <path d="M84 40C80 60 78 80 74 96" stroke="#6f8f3a" strokeWidth="2.6" fill="none" />
        <ellipse cx="88" cy="58" rx="5" ry="10" fill="#d9ec9a" opacity=".45" />
      </g>
    </svg>
  )
}

export function Syrup() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="a-sy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff4d63" />
          <stop offset="1" stopColor="#8f0e27" />
        </linearGradient>
      </defs>
      <path d="M60 8C60 8 98 52 98 74C98 96 81 112 60 112C39 112 22 96 22 74C22 52 60 8 60 8Z" fill="url(#a-sy)" />
      <path d="M40 70C40 82 46 92 54 96" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".45" />
      <ellipse cx="86" cy="104" rx="14" ry="4" fill="#c21d3a" opacity=".6" />
    </svg>
  )
}

export function IceCream() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="a-ic" cx="40%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffd0de" />
          <stop offset=".6" stopColor="#f58aa8" />
          <stop offset="1" stopColor="#d9567c" />
        </radialGradient>
      </defs>
      <path d="M14 70C10 36 34 12 60 12C86 12 110 36 106 70C112 74 108 86 98 86H22C12 86 8 74 14 70Z" fill="url(#a-ic)" />
      <path d="M30 86C30 98 36 104 40 98C42 92 44 90 48 96C52 106 58 104 58 94C60 86 62 86 64 92C66 104 74 104 74 92C76 90 80 90 82 96C84 104 92 100 90 86Z" fill="#f58aa8" />
      <path d="M44 28C54 36 52 56 46 66" stroke="#c21d3a" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".75" />
      <path d="M78 30C84 40 82 52 78 60" stroke="#c21d3a" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".6" />
      {[[34, 50], [70, 24], [86, 56], [56, 60], [26, 66], [96, 70], [64, 76]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="#fff" opacity=".7" />
      ))}
      <ellipse cx="36" cy="34" rx="8" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 36 34)" />
    </svg>
  )
}

export const artMap = {
  strawberry: Strawberry,
  jelly: Jelly,
  basil: Basil,
  sev: Sev,
  nuts: Nuts,
  syrup: Syrup,
  icecream: IceCream,
}
