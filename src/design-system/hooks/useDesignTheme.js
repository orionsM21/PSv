import { useMemo } from 'react';
import { designTheme } from '../theme';

export const useDesignTheme = () => useMemo(() => designTheme, []);
