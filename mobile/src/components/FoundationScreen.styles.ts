import { StyleSheet } from 'react-native';
import { coramTheme } from '../theme/coramTheme';

export const foundationStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: coramTheme.colors.canvas,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: coramTheme.spacing.lg,
    paddingVertical: coramTheme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: coramTheme.spacing.lg,
    borderRadius: coramTheme.radii.lg,
    borderWidth: 1,
    borderColor: coramTheme.colors.border,
    backgroundColor: coramTheme.colors.surface,
    gap: coramTheme.spacing.md,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: coramTheme.radii.md,
  },
  eyebrow: {
    color: coramTheme.colors.gold,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: coramTheme.colors.ink,
    fontSize: 34,
    fontWeight: '700',
  },
  body: {
    color: coramTheme.colors.inkMuted,
    fontSize: 17,
    lineHeight: 26,
  },
  status: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: coramTheme.spacing.md,
    borderRadius: coramTheme.radii.md,
    backgroundColor: coramTheme.colors.botanicalSoft,
  },
  statusText: {
    color: coramTheme.colors.botanical,
    fontSize: 15,
    fontWeight: '700',
  },
});
