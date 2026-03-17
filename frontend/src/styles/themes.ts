export interface ThemeTokens {
  'canvas': string;
  'surface': string;
  'surface-warm': string;
  'ink': string;
  'ink-muted': string;
  'ink-subtle': string;
  'primary': string;
  'primary-hover': string;
  'primary-text': string;
  'border': string;
  'border-hover': string;
}

export interface Theme {
  label: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

// ─── Add or edit themes here ────────────────────────────────────────────────

export const themes: Record<string, Theme> = {
  gold: {
    label: 'Gold',
    light: {
      'canvas':        '#faf6f0',
      'surface':       '#ffffff',
      'surface-warm':  '#f5ede3',
      'ink':           '#1c1410',
      'ink-muted':     '#6b5e55',
      'ink-subtle':    '#9e9490',
      'primary':       '#c9a84c',
      'primary-hover': '#b8943a',
      'primary-text':  '#ffffff',
      'border':        '#e8e0d5',
      'border-hover':  '#c4b4a4',
    },
    dark: {
      'canvas':        '#141210',
      'surface':       '#1e1c18',
      'surface-warm':  '#252018',
      'ink':           '#f0e8d8',
      'ink-muted':     '#a89f8c',
      'ink-subtle':    '#6b6258',
      'primary':       '#c9a84c',
      'primary-hover': '#b8943a',
      'primary-text':  '#1a1210',
      'border':        '#2e2920',
      'border-hover':  '#403830',
    },
  },

  blue: {
    label: 'Blue',
    light: {
      'canvas':        '#f3f5f8',
      'surface':       '#ffffff',
      'surface-warm':  '#eaeff5',
      'ink':           '#1a1e2a',
      'ink-muted':     '#5a6070',
      'ink-subtle':    '#9098a8',
      'primary':       '#3b5b99',
      'primary-hover': '#2d4780',
      'primary-text':  '#ffffff',
      'border':        '#d8dde8',
      'border-hover':  '#b0b8c8',
    },
    dark: {
      'canvas':        '#0f1219',
      'surface':       '#161b26',
      'surface-warm':  '#1c2333',
      'ink':           '#e0e8f5',
      'ink-muted':     '#8898b8',
      'ink-subtle':    '#546080',
      'primary':       '#5b7ec5',
      'primary-hover': '#4a6ab0',
      'primary-text':  '#ffffff',
      'border':        '#1e2840',
      'border-hover':  '#2a3858',
    },
  },

  orange: {
    label: 'Orange',
    light: {
      'canvas':        '#faf5f0',
      'surface':       '#ffffff',
      'surface-warm':  '#f5ebe0',
      'ink':           '#1e1a14',
      'ink-muted':     '#6b6050',
      'ink-subtle':    '#a09888',
      'primary':       '#b8723a',
      'primary-hover': '#9e5f2e',
      'primary-text':  '#ffffff',
      'border':        '#e8ddd0',
      'border-hover':  '#c8b8a0',
    },
    dark: {
      'canvas':        '#141008',
      'surface':       '#1e1a12',
      'surface-warm':  '#252018',
      'ink':           '#f0e8d8',
      'ink-muted':     '#a89878',
      'ink-subtle':    '#6b6048',
      'primary':       '#c07840',
      'primary-hover': '#a86030',
      'primary-text':  '#ffffff',
      'border':        '#2e2418',
      'border-hover':  '#403020',
    },
  },

  red: {
    label: 'Red',
    light: {
      'canvas':        '#faf6f0',
      'surface':       '#ffffff',
      'surface-warm':  '#f9eeee',
      'ink':           '#1c1410',
      'ink-muted':     '#6b5e55',
      'ink-subtle':    '#9e9490',
      'primary':       '#7c3238',
      'primary-hover': '#641e24',
      'primary-text':  '#ffffff',
      'border':        '#e8e0d5',
      'border-hover':  '#c4b4a4',
    },
    dark: {
      'canvas':        '#130e0e',
      'surface':       '#1e1515',
      'surface-warm':  '#251a1a',
      'ink':           '#f0e8e8',
      'ink-muted':     '#a89090',
      'ink-subtle':    '#6b5858',
      'primary':       '#a04048',
      'primary-hover': '#8b3038',
      'primary-text':  '#ffffff',
      'border':        '#2e2020',
      'border-hover':  '#403030',
    },
  },
};

export const DEFAULT_THEME = 'gold';
