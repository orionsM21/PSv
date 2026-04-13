import React from 'react';
import ModuleSelectorView from '../components/ModuleSelectorView';
import useModuleSelector from '../hooks/useModuleSelector';

export default function ModuleSelectorScreen() {
  const moduleSelector = useModuleSelector();

  return <ModuleSelectorView {...moduleSelector} />;
}
