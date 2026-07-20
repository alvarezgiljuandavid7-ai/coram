export const coramColors = {
  canvas: '#F8F3E7',
  surface: '#FFFCF5',
  ink: '#082A4A',
  inkMuted: '#647184',
  botanical: '#4F8F5B',
  botanicalSoft: '#E6F0E4',
  gold: '#C9972B',
  goldSoft: '#F8EBC5',
  action: '#2563EB',
  actionHover: '#1D4ED8',
  actionActive: '#1E40AF',
  actionSoft: '#EFF6FF',
  success: '#4F8F5B',
  danger: '#B42318',
  border: '#D8DDE3',
} as const;

export const coramActionColors = {
  primary: coramColors.action,
  hover: coramColors.actionHover,
  active: coramColors.actionActive,
  soft: coramColors.actionSoft,
  focusRing: 'rgba(37, 99, 235, 0.42)',
} as const;

export const coramSpacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const coramRadii = { sm: 8, md: 14, lg: 20 } as const;
