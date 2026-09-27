// Ported 1:1 from the web app's CSS custom properties (style.css :root and
// [data-theme="dark"]). Keep these two objects in exact sync with the web
// version whenever the web palette changes — do not "improve" or re-tune
// any value here without updating style.css first.
//
// Note: the web CSS's [data-theme="dark"] override only redefines the
// *-bg tokens for success/warning/danger, not the foreground --success/
// --warning/--danger colors themselves — so those three stay identical
// between light and dark mode here too, exactly as in the web app.
export const lightColors = {
  bg: '#F5F6F8',            // --gray-50
  surface: '#FFFFFF',       // --white
  surfaceRaised: '#FFFFFF', // --surface-raised
  surfaceSunken: '#F5F6F8', // --gray-50
  border: '#E1E4E9',        // --gray-200
  borderSoft: '#EEF0F3',    // --gray-100
  textPrimary: '#11141C',   // --ink
  textSecondary: '#6E7683', // --gray-500
  textTertiary: '#9AA1AC',  // --gray-400
  textInverse: '#FFFFFF',
  accent: '#00095B',        // --blue-600
  accentSoft: '#F2F3FA',    // --blue-50
  accentSoftStrong: '#E4E6F5', // --blue-100
  success: '#1C8A5A',
  successBg: '#E8F6EF',
  warning: '#B4740F',
  warningBg: '#FBF1DF',
  danger: '#C23A3A',
  dangerBg: '#FBEAEA',
  navy950: '#00095B',
  navy900: '#0B1568',
  navy800: '#172476',
};

export const darkColors = {
  bg: '#070B26',
  surface: '#151A47',
  surfaceRaised: '#1E255A',
  surfaceSunken: '#0A0E2E',
  border: '#2C3374',
  borderSoft: '#20265A',
  textPrimary: '#F3F5F9',
  textSecondary: '#9AA7C2',
  textTertiary: '#6C7999',
  textInverse: '#00095B', // var(--navy-950)
  accent: '#707CFF',
  accentSoft: '#1B2158',
  accentSoftStrong: '#262E72',
  // Unchanged from light — the web CSS never overrides these in dark mode.
  success: '#1C8A5A',
  successBg: '#12301F',
  warning: '#B4740F',
  warningBg: '#332506',
  danger: '#C23A3A',
  dangerBg: '#331414',
  navy950: '#00095B',
  navy900: '#0B1568',
  navy800: '#172476',
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Cross-platform card/tab shadow, replacing the old shadowColor/
// shadowOpacity/shadowRadius/shadowOffset/elevation quintet everywhere.
// React Native 0.86 (installed here, confirmed in
// node_modules/react-native/Libraries/StyleSheet/processBoxShadow.js and
// StyleSheetTypes) parses a single `boxShadow` CSS string on iOS/Android
// (new architecture, enabled in app.json) exactly like it already did on
// react-native-web — so one property now covers every platform, and it's
// also what makes RN Web's console warning ('"shadow*" style props are
// deprecated. Use "boxShadow"') go away, since RN Web never understood the
// old props to begin with.
export function boxShadow(color: string, opacity: number, radius: number, offsetY = 0, offsetX = 0) {
  return { boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${hexToRgba(color, opacity)}` };
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

// --r-sm / --r-md / --r-lg / --r-xl / --r-pill from style.css
export const radii = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

// --font-ui / --font-display (both 'Archivo' in the web app)
export const fontFamily = 'Archivo_400Regular';
export const fontFamilyMedium = 'Archivo_500Medium';
export const fontFamilySemiBold = 'Archivo_600SemiBold';
export const fontFamilyBold = 'Archivo_700Bold';
export const fontFamilyExtraBold = 'Archivo_800ExtraBold';
export const fontFamilyBlack = 'Archivo_900Black';

export type ThemeMode = 'light' | 'dark';

export function getTheme(mode: ThemeMode) {
  const c = mode === 'dark' ? darkColors : lightColors;
  return { mode, colors: c, spacing, radii };
}
