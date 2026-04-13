import {createModuleTheme} from '../../../design-system/theme/moduleTheme';
import {losColors} from './losTheme';

export const losTheme = {
  ...createModuleTheme({
    id: 'los',
    title: 'Loan Origination System',
    accent: losColors.brand[600],
    gradient: ['#082032', '#0B3C73', '#22A2FF'],
  }),
  legacy: losColors,
};

export default losTheme;
