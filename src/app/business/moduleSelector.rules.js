export const MODULE_SELECTOR_CARD_HEIGHT = 192;

export function buildModuleSelectorSummary({
  role,
  totalModules,
  allowedModulesCount,
}) {
  const unavailableCount = totalModules - allowedModulesCount;
  const isRoleSelected = Boolean(role);

  return {
    isRoleSelected,
    unavailableCount,
    availableValue: isRoleSelected ? String(allowedModulesCount) : '--',
    hiddenValue: isRoleSelected ? String(unavailableCount) : '--',
    controlMeta: isRoleSelected ? `${allowedModulesCount} ready` : '',
    sectionMeta: !isRoleSelected
      ? ''
      : unavailableCount > 0
      ? `${unavailableCount} restricted`
      : 'All visible',
  };
}

export function canNavigateToModule({moduleId, isNavigating}) {
  return Boolean(moduleId) && !isNavigating;
}
