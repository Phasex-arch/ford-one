import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface GaugeRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  textColor?: string;
  ringColor?: string;
  trackColor?: string;
}

// A circular percentage gauge, the RN/SVG equivalent of the web app's
// gaugeSVG() helper. size in px, value 0-100.
export default function GaugeRing({ value, size = 72, strokeWidth = 7, textColor, ringColor, trackColor }: GaugeRingProps) {
  const { theme } = useTheme();
  // Defensive guard: a caller passing `undefined`/`NaN` (e.g. data not yet
  // ready on first render) must never reach the SVG props below — a
  // non-finite cx/cy/r/strokeDasharray can throw in some react-native-svg
  // versions/platforms, especially under dev-mode prop validation.
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - safeValue / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center} cy={center} r={radius}
          stroke={trackColor || theme.colors.borderSoft} strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={center} cy={center} r={radius}
          stroke={ringColor || theme.colors.accent} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.pointerNone]}>
        <View style={styles.centerLabel}>
          <Text style={[styles.centerText, { color: textColor || theme.colors.textPrimary, fontSize: size * 0.24 }]}>
            {Math.round(safeValue)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerLabel: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { fontWeight: '800' },
  // `pointerEvents` as a JSX prop is deprecated on RN Web ("Use
  // style.pointerEvents"); merged into the style array above instead.
  pointerNone: { pointerEvents: 'none' },
});
