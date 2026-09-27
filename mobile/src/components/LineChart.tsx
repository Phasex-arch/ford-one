import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface LineChartPoint {
  label: string;
  score: number;
}

interface LineChartProps {
  points: LineChartPoint[];
  height?: number;
}

// A minimal line chart — the RN/SVG equivalent of the web app's inline
// SVG evolution chart. points: [{ label, score }]
export default function LineChart({ points, height = 110 }: LineChartProps) {
  const { theme } = useTheme();
  const width = 300;
  const scores = points.map((p) => p.score);
  const minVal = Math.min(...scores) - 1;
  const maxVal = Math.max(...scores) + 1;

  const coords = points.map((p, i) => {
    const x = 10 + (i / (points.length - 1)) * (width - 20);
    const y = height - 20 - ((p.score - minVal) / (maxVal - minVal)) * (height - 40);
    return { ...p, x, y };
  });

  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={d} fill="none" stroke={theme.colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c) => <Circle key={c.label} cx={c.x} cy={c.y} r={3.5} fill={theme.colors.accent} />)}
      </Svg>
      <View style={styles.labelsRow}>
        {points.map((p) => (
          <View key={p.label} style={styles.labelCol}>
            <Text style={[styles.label, { color: theme.colors.textTertiary }]}>{p.label}</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{p.score}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  labelCol: { alignItems: 'center' },
  label: { fontSize: 10.5, fontWeight: '600' },
  value: { fontSize: 12.5, fontWeight: '700', marginTop: 2 },
});
