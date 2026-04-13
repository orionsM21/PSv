import {createModuleTheme} from '../../../design-system/theme/moduleTheme';
import {GOLD_THEME} from './goldTheme';

export const goldTheme = {
  ...createModuleTheme({
    id: 'gold',
    title: 'Gold Loan',
    accent: GOLD_THEME.accentStrong,
    gradient: GOLD_THEME.background,
  }),
  legacy: GOLD_THEME,
};

export default goldTheme;
