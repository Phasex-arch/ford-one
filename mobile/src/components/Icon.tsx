// Custom hand-drawn icon set — a 1:1 port of ICONS/alertIcon from the
// reference HTML app's script.js, rendered with react-native-svg. This
// replaces generic Feather icons everywhere so the app matches the HTML's
// actual icon style exactly, not a lookalike icon font.
//
// Usage: <Icon name="home" size={19} color={theme.colors.text} />
// `size` (when passed) overrides the icon's own natural width/height from
// the HTML uniformly; otherwise each icon falls back to its own default
// size below, exactly like the HTML markup.

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Svg, Path, Rect, Circle } from 'react-native-svg';

type IconRender = (color: string) => React.ReactNode;

// Each entry: default size (from the HTML's own width/height) + a render
// function that emits the same paths/shapes as the HTML's inline SVG,
// using `color` for every `currentColor` occurrence.
const ICONS = {
  heart: {
    size: 18,
    render: (color) => (
      <Path
        d="M12 20.5s-7.5-4.6-9.8-9.2C.6 7.8 2.4 4.5 5.8 4c2-.3 3.7.7 6.2 3.2C14.5 4.7 16.2 3.7 18.2 4c3.4.5 5.2 3.8 3.6 7.3C19.5 15.9 12 20.5 12 20.5z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    ),
  },
  lock: {
    size: 19,
    render: (color) => (
      <>
        <Rect x={5} y={11} width={14} height={9} rx={2} stroke={color} strokeWidth={1.7} />
        <Path d="M8 11V7.5a4 4 0 018 0V11" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
        <Circle cx={12} cy={15.3} r={1.4} fill={color} />
      </>
    ),
  },
  home: {
    size: 19,
    render: (color) => (
      <Path
        d="M4 11.5L12 4l8 7.5M6 10v9a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1v-9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  car: {
    size: 19,
    render: (color) => (
      <>
        <Path
          d="M4 16V12l1.8-4.6A2 2 0 017.6 6h8.8a2 2 0 011.8 1.4L20 12v4"
          stroke={color}
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        <Path
          d="M4 16h16v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z"
          stroke={color}
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        <Circle cx={7.5} cy={13.5} r={1} fill={color} />
        <Circle cx={16.5} cy={13.5} r={1} fill={color} />
      </>
    ),
  },
  pulse: {
    size: 19,
    render: (color) => (
      <Path
        d="M3 12h4l2-7 4 14 2-7h6"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  wrench: {
    size: 19,
    render: (color) => (
      <Path
        d="M14.7 6.3a4 4 0 00-5.4 4.9L3 17.5 5.5 20l6.3-6.3a4 4 0 004.9-5.4l-2.6 2.6-2-2 2.6-2.6z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    ),
  },
  history: {
    size: 19,
    render: (color) => (
      <>
        <Path d="M3 12a9 9 0 109-9v4" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
        <Path
          d="M3 3v4h4M12 8v4l3 2"
          stroke={color}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  alert: {
    size: 19,
    render: (color) => (
      <>
        <Path d="M12 4l9.5 16H2.5L12 4z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
        <Path d="M12 10v4M12 17.2v.1" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      </>
    ),
  },
  bell: {
    size: 19,
    render: (color) => (
      <>
        <Path
          d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
          stroke={color}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M13.7 21a2 2 0 01-3.4 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      </>
    ),
  },
  help: {
    size: 19,
    render: (color) => (
      <>
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.7} />
        <Path
          d="M9.4 9.3a2.6 2.6 0 114.6 1.6c-.8.8-1.4 1.1-1.4 2.3"
          stroke={color}
          strokeWidth={1.7}
          strokeLinecap="round"
        />
        <Circle cx={12} cy={16.4} r={1} fill={color} />
      </>
    ),
  },
  send: {
    size: 18,
    render: (color) => (
      <Path
        d="M12 19V5M12 5l-6 6M12 5l6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  calendar: {
    size: 19,
    render: (color) => (
      <>
        <Rect x={3.5} y={5} width={17} height={16} rx={2.5} stroke={color} strokeWidth={1.7} />
        <Path d="M8 3v4M16 3v4M3.5 10h17" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      </>
    ),
  },
  stethoscope: {
    size: 19,
    render: (color) => (
      <>
        <Path d="M6 4v6a4 4 0 008 0V4" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
        <Path d="M18 10v2a6 6 0 01-12 0v-1" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
        <Circle cx={19} cy={9} r={2} stroke={color} strokeWidth={1.7} />
      </>
    ),
  },
  spark: {
    size: 19,
    render: (color) => (
      <Path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    ),
  },
  scale: {
    size: 19,
    render: (color) => (
      <>
        <Path d="M12 4v14M6 18h12" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        <Path d="M4 8h6M14 8h6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        <Circle cx={4} cy={8} r={2.1} stroke={color} strokeWidth={1.6} />
        <Circle cx={20} cy={8} r={2.1} stroke={color} strokeWidth={1.6} />
      </>
    ),
  },
  swap: {
    size: 19,
    render: (color) => (
      <Path
        d="M4 8h13l-3-3M20 16H7l3 3"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  tag: {
    size: 19,
    render: (color) => (
      <>
        <Path
          d="M11.5 3.5H5a1.5 1.5 0 00-1.5 1.5v6.5L13 21l8-8-9.5-9.5z"
          stroke={color}
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        <Circle cx={8} cy={8} r={1.3} fill={color} />
      </>
    ),
  },
  pin: {
    size: 19,
    render: (color) => (
      <>
        <Path
          d="M12 21s7-6.5 7-11.6A7 7 0 105 9.4C5 14.5 12 21 12 21z"
          stroke={color}
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        <Circle cx={12} cy={9.3} r={2.4} stroke={color} strokeWidth={1.7} />
      </>
    ),
  },
  user: {
    size: 19,
    render: (color) => (
      <>
        <Circle cx={12} cy={8} r={3.6} stroke={color} strokeWidth={1.7} />
        <Path
          d="M4.5 20c1.4-3.6 4.4-5.6 7.5-5.6s6.1 2 7.5 5.6"
          stroke={color}
          strokeWidth={1.7}
          strokeLinecap="round"
        />
      </>
    ),
  },
  chevron: {
    size: 16,
    render: (color) => (
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  check: {
    size: 16,
    render: (color) => (
      <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  brake: {
    size: 18,
    render: (color) => (
      <>
        <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.6} />
        <Circle cx={12} cy={12} r={2.2} fill={color} />
        <Path d="M12 4v3M12 17v3M4 12h3M17 12h3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      </>
    ),
  },
  oil: {
    size: 18,
    render: (color) => (
      <Path d="M12 3l5 8a5 5 0 11-10 0l5-8z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    ),
  },
  tire: {
    size: 18,
    render: (color) => (
      <>
        <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.7} />
        <Circle cx={12} cy={12} r={3.5} stroke={color} strokeWidth={1.7} />
        <Path
          d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18.02 5.98l-1.4 1.4M7.38 16.62l-1.4 1.4M18.02 18.02l-1.4-1.4M7.38 7.38l-1.4-1.4"
          stroke={color}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </>
    ),
  },
  gauge: {
    size: 19,
    render: (color) => (
      <>
        <Path d="M4 15a8 8 0 1116 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
        <Path d="M12 15l3.5-4.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      </>
    ),
  },
  battery: {
    size: 18,
    render: (color) => (
      <>
        <Rect x={3} y={8} width={16} height={9} rx={2} stroke={color} strokeWidth={1.7} />
        <Path d="M20 11v3" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      </>
    ),
  },
  drop: {
    size: 18,
    render: (color) => (
      <Path
        d="M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    ),
  },
  bolt: {
    size: 18,
    render: (color) => (
      <Path d="M13 3L5 14h6l-1 7 9-12h-6l1-6z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    ),
  },
  spring: {
    size: 18,
    render: (color) => (
      <Path
        d="M6 4v3l6 2-6 2 6 2-6 2v3M18 4v16"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    ),
  },
  // Overflow-menu / "more" dots icon — used for the bottom nav's "Mais"
  // tab, inlined directly in the HTML (not part of ICONS) as three dots.
  dots: {
    size: 19,
    render: (color) => (
      <>
        <Circle cx={5} cy={12} r={1.6} fill={color} />
        <Circle cx={12} cy={12} r={1.6} fill={color} />
        <Circle cx={19} cy={12} r={1.6} fill={color} />
      </>
    ),
  },
  // Hamburger menu — the topbar's "abrir menu" button, inlined directly in
  // index.html (not part of ICONS) as three horizontal bars.
  menu: {
    size: 20,
    render: (color) => (
      <Path d="M3 6h18M3 12h18M3 18h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    ),
  },
  // Dark-mode toggle sun — index.html's .theme-toggle icon (sidebar footer
  // and mobile drawer). The HTML always shows this one sun glyph, in both
  // light and dark mode — there is no separate "moon" icon.
  sun: {
    size: 16,
    render: (color) => (
      <>
        <Circle cx={12} cy={12} r={4.2} stroke={color} strokeWidth={1.8} />
        <Path
          d="M12 2.5v2.4M12 19v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19 12h2.4M4.9 19l1.7-1.7M17.4 6.6l1.7-1.7"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </>
    ),
  },
  // Empty-state 4-point sparkle — script.js's emptyBlock() icon, used for
  // every "nothing here" state in the HTML (distinct from ICONS.spark).
  emptyStar: {
    size: 24,
    render: (color) => (
      <Path
        d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    ),
  },
} satisfies Record<string, { size: number; render: IconRender }>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Icon({ name, size, color = '#000000', style }: IconProps) {
  const def = ICONS[name];
  if (!def) {
    if (__DEV__) {
      console.warn(`Icon: unknown icon name "${name}"`);
    }
    return null;
  }
  const s = size ?? def.size;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={style}>
      {def.render(color)}
    </Svg>
  );
}

export { ICONS };
