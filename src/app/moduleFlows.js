import GoldLogin from '../modules/goldLoan/screens/GoldLogin';
import VehicleLogin from '../modules/vehicleLoan/screen/VehicleLogin';
import LOSLogin from '../modules/los/screen/LOSLogin';
import CollectionLogin from '../modules/collection/screen/CollectionLogin';
import PaymentLogin from '../modules/payment/PaymentLogin';
import ChatLogin from '../modules/chatApp/screen/ChatLogin';
import GoldLoanNavigator from '../modules/goldLoan/navigation';
import VehicleLoanNavigator from '../modules/vehicleLoan/navigation';
import LOSNavigator from '../modules/los/navigation';
import CollectionNavigator from '../modules/collection/navigation';
import PaymentNavigator from '../modules/payment/navigation';
import ChatAppNavigator from '../modules/chatApp/navigation';
import ModuleSelector from './ModuleSelector';
import AuthBootstrap from './AuthBootstrap';

export const MODULE_FLOW_CONFIG = {
  gold: {
    screenName: 'GoldFlow',
    navigator: GoldLoanNavigator,
    login: GoldLogin,
  },
  vehicle: {
    screenName: 'VehicleFlow',
    navigator: VehicleLoanNavigator,
    login: VehicleLogin,
  },
  los: {
    screenName: 'LOSFlow',
    navigator: LOSNavigator,
    login: LOSLogin,
  },
  collection: {
    screenName: 'CollectionFlow',
    navigator: CollectionNavigator,
    login: CollectionLogin,
  },
  payment: {
    screenName: 'PaymentFlow',
    navigator: PaymentNavigator,
    login: PaymentLogin,
  },
  chat: {
    screenName: 'ChatFlow',
    navigator: ChatAppNavigator,
    login: ChatLogin,
  },
};

export function resolveActiveScreen({
  bootstrapped,
  selectedModule,
  isLoggedIn,
}) {
  if (!bootstrapped) {
    return {
      name: 'AuthBootstrap',
      component: AuthBootstrap,
      navigationKey: 'bootstrap',
    };
  }

  if (!selectedModule) {
    return {
      name: 'ModuleSelector',
      component: ModuleSelector,
      navigationKey: 'module-selector',
    };
  }

  const moduleFlow = MODULE_FLOW_CONFIG[selectedModule];
  if (!moduleFlow) {
    return {
      name: 'ModuleSelector',
      component: ModuleSelector,
      navigationKey: 'module-selector-fallback',
    };
  }

  return {
    name: moduleFlow.screenName,
    component: isLoggedIn ? moduleFlow.navigator : moduleFlow.login,
    navigationKey: `${selectedModule}-${isLoggedIn ? 'app' : 'auth'}`,
  };
}
