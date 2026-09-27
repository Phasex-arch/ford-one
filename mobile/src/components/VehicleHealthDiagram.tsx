import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import VehicleHeroArt from './VehicleHeroArt';
import { HEALTH_HOTSPOTS } from '../constants/healthHotspots';
import type { VehicleSystem } from '../types';

interface HotspotDotProps {
  warn: boolean;
  color: string;
}

function HotspotDot({ warn, color }: HotspotDotProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!warn) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [warn, pulse]);

  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.08] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const size = warn ? 14 : 11;

  return (
    <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
      {warn && (
        <Animated.View
          style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            backgroundColor: color, opacity: ringOpacity, transform: [{ scale: ringScale }],
          }}
        />
      )}
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

// The RN equivalent of the web app's "Inspeção do veículo" card
// (health-diagram-stage / HEALTH_HOTSPOTS in script.js): the real vehicle
// photo with a tappable dot over each monitored system, positioned by the
// same % coordinates. Warn systems pulse in the warning color; tapping a
// dot opens the SystemDetailSheet, same as a "Todos os sistemas" row.
interface VehicleHealthDiagramProps {
  photoKey: React.ComponentProps<typeof VehicleHeroArt>['photoKey'];
  systems: VehicleSystem[];
  onOpenSystem: (system: VehicleSystem) => void;
}

export default function VehicleHealthDiagram({ photoKey, systems, onOpenSystem }: VehicleHealthDiagramProps) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <View>
      <View style={s.stage}>
        <VehicleHeroArt photoKey={photoKey} fill />
        {systems.map((sys) => {
          const pos: { x: number; y: number } | undefined = (HEALTH_HOTSPOTS as Record<string, { x: number; y: number }>)[sys.id];
          if (!pos) return null;
          const warn = sys.status === 'warn';
          return (
            <Pressable
              key={sys.id}
              onPress={() => onOpenSystem(sys)}
              accessibilityLabel={`${sys.label}: ${sys.score}%, ${sys.condition}`}
              style={[s.hotspot, { left: `${pos.x}%`, top: `${pos.y}%` }]}
              hitSlop={10}
            >
              <HotspotDot warn={warn} color={warn ? theme.colors.warning : theme.colors.accent} />
            </Pressable>
          );
        })}
      </View>
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: theme.colors.accent }]} />
          <Text style={s.legendText}>Dentro do esperado</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={s.legendText}>Pede atenção</Text>
        </View>
      </View>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  stage: {
    position: 'relative', width: '100%', aspectRatio: 1000 / 392,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  hotspot: { position: 'absolute', marginLeft: -15, marginTop: -15, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', gap: 18, flexWrap: 'wrap', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 4.5 },
  legendText: { fontSize: 12, color: theme.colors.textSecondary },
});
