import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import DrawerBase from './DrawerBase';
import CollectionDrawerUI from './collection/CollectionDrawerUI';
import GenericDrawer from './GenericDrawer';
import LOSDrawerUI from './los/LOSDrawerUI';
import {getGenericDrawerConfig} from '../app/moduleRegistry';

export default function DrawerRoot() {
  const module = useSelector(state => state.module.selectedModule);

  const genericDrawerConfig = useMemo(
    () => getGenericDrawerConfig(module),
    [module],
  );

  const renderDrawer = () => {
    switch (module) {
      case 'los':
        return <LOSDrawerUI />;
      case 'collection':
        return <CollectionDrawerUI />;
      case 'gold':
      case 'vehicle':
      case 'payment':
        return <GenericDrawer config={genericDrawerConfig} />;
      default:
        return null;
    }
  };

  return <DrawerBase>{renderDrawer()}</DrawerBase>;
}
