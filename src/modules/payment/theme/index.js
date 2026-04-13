import {createModuleTheme} from '../../../design-system/theme/moduleTheme';
import {PAYMENT_THEME} from './paymentTheme';

export const paymentTheme = {
  ...createModuleTheme({
    id: 'payment',
    title: 'Payment',
    accent: PAYMENT_THEME.accent,
    gradient: PAYMENT_THEME.background,
  }),
  legacy: PAYMENT_THEME,
};

export default paymentTheme;
