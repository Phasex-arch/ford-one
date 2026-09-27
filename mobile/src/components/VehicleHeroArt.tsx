import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import vehiclePhotos from '../constants/vehiclePhotos';

// Mirrors the web app's vehicleHeroArt(): the real vehicle photo
// (ford-maverick.png / ford-ranger.png / ford-mache.png, picked by
// vehicle.photo), with a simple fallback if the photo can't load.
// `fill` (used by VehicleHealthDiagram's aspect-ratio stage, the RN
// equivalent of .health-car-img{position:absolute;inset:0}) stretches the
// image/fallback to its parent instead of sizing itself by `size`.
interface VehicleHeroArtProps {
  photoKey: keyof typeof vehiclePhotos;
  size?: number;
  fill?: boolean;
}

export default function VehicleHeroArt({ photoKey, size = 132, fill = false }: VehicleHeroArtProps) {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  const source = vehiclePhotos[photoKey];
  // Note: position:absolute + inset:0 alone does NOT stretch a replaced
  // element (<img>) on web when width/height are left "auto" — it falls
  // back to the image's intrinsic size instead. width/height:'100%' must
  // be explicit for the fill-container case.
  const box = fill
    ? { ...StyleSheet.absoluteFill, width: '100%' as const, height: '100%' as const }
    : { width: size * 1.7, height: size };

  if (!source || failed) {
    return (
      <View style={[styles.fallback, box, { backgroundColor: theme.colors.accentSoft }]}>
        <Icon name="car" size={(fill ? 80 : size) * 0.4} color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={box}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
