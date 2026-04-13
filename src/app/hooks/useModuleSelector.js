import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';
import {triggerHaptic} from '../../common/utils/haptics';
import {setModule} from '../../redux/moduleSlice';
import {
  buildModuleSelectorSummary,
  canNavigateToModule,
} from '../business/moduleSelector.rules';
import {getAllowedModules, MODULE_CATALOG} from '../moduleRegistry';

const NAVIGATION_LOCK_MS = 400;

export default function useModuleSelector() {
  const dispatch = useDispatch();
  const [role, setRole] = useState(null);
  const [focus, setFocus] = useState(false);
  const featureOverridesRef = useRef({});
  const isNavigatingRef = useRef(false);
  const navigationTimerRef = useRef(null);

  const allowedModules = useMemo(
    () => getAllowedModules(role, featureOverridesRef.current),
    [role],
  );

  const summary = useMemo(
    () =>
      buildModuleSelectorSummary({
        role,
        totalModules: MODULE_CATALOG.length,
        allowedModulesCount: allowedModules.length,
      }),
    [allowedModules.length, role],
  );

  const handleSelectModule = useCallback(
    moduleId => {
      if (
        !canNavigateToModule({moduleId, isNavigating: isNavigatingRef.current})
      ) {
        return;
      }

      isNavigatingRef.current = true;
      triggerHaptic();
      dispatch(setModule(moduleId));

      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, NAVIGATION_LOCK_MS);
    },
    [dispatch],
  );

  const handleRoleChange = useCallback(item => {
    setRole(item?.value || null);
    setFocus(false);
  }, []);

  const handleFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocus(false);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(navigationTimerRef.current);
    };
  }, []);

  return {
    role,
    focus,
    allowedModules,
    totalModules: MODULE_CATALOG.length,
    summary,
    onSelectModule: handleSelectModule,
    onRoleChange: handleRoleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
}
