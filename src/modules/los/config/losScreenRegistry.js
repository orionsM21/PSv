import CreditWorkList from '../screen/PreUnderWritingpages/CreditWorklist.js';
import InitiateverficationProcess from '../screen/PreUnderWritingpages/initiateverficationProcess.js';
import InitaiateRCUProcess from '../screen/PreUnderWritingpages/InitiateRCUProcess.js';
import RCUProcess from '../screen/PreUnderWritingpages/RCUProcess.js';
import PersonalVerificationProcess from '../screen/PreUnderWritingpages/PersonalVerificationProcess.js';
import OfficeVerifcationProcess from '../screen/PreUnderWritingpages/OfficeVerifcationProcess.js';
import ResidenceVerificationProcess from '../screen/PreUnderWritingpages/ResidenceVerificationProcess.js';
import ReviewDecision from '../screen/Component/ReviewDecision.js';
import Credithistory from '../screen/Component/Credithistory.js';
import TabDetailsCredit from '../screen/Component/TabDetailCredit.js';
import TabDetails from '../screen/Component/TabDetails.js';
import Viaemail from '../../collection/screen/Viaemail';
import Forgotpassword from '../../collection/screen/Forgotpassword';
import FirstRoute from '../screen/Home.js';
import SuccessPage from '../screen/Component/SuccessPage.js';
import PreHistory from '../screen/PreUnderWritingpages/PreHistory.js';
import Lead from '../screen/PreUnderWritingpages/Lead.js';
import AIassistant from '../screen/PreUnderWritingpages/AIassistant.js';
import History from '../screen/Sales/History.js';
import QDE from '../screen/Sales/QDE.js';
import SalesPage from '../screen/SalesPage.js';
import PreUnderwritingPage from '../screen/PreUnderwritingPage.js';
import SalesDashboard from '../screen/Sales/SalesDashboard.js';
import PreUnderWriterDashboard from '../screen/PreUnderWritingpages/preunderWriterDashboard.js';
import WorkList from '../screen/Sales/WorkList.js';
import LOSLogin from '../screen/LOSLogin.js';
import VerificationWaiverProcess from '../screen/PreUnderWritingpages/VerificationWaiverProcess.js';
import DecisionProcess from '../screen/Underwriting/DecisonProcess.js';
import VerificationScreen from '../screen/Verification/VerificationScreen.js';
import AuthLogin from '../screen/AuthLogin.js';
import NotificationPanel from '../screen/PreUnderWritingpages/NotificationPanel.js';
import NotificationHistoryPanel from '../screen/PreUnderWritingpages/NotificationHistoryPanel.js';

export const LOS_AUTH_SCREENS = [
  { name: 'AuthLogin', component: AuthLogin },
  { name: 'LOSLogin', component: LOSLogin },
];

export const LOS_ROLE_ENTRY_SCREENS = {
  sales: { name: 'Sales', component: SalesPage },
  credit: { name: 'PreUnderwriting', component: PreUnderwritingPage },
};

export const LOS_WORKFLOW_SCREENS = [
  { name: 'VerificationScreen', component: VerificationScreen, options: { headerShown: false } },
  { name: 'Home', component: SalesDashboard, options: { headerShown: false } },
  { name: 'Dashboard', component: PreUnderWriterDashboard, options: { headerShown: false } },
  { name: 'Lead', component: QDE, options: { headerShown: false } },
  { name: 'Application Status', component: History, options: { headerShown: false } },
  { name: 'Worklist', component: WorkList, options: { headerShown: false } },
  { name: 'AIassistant', component: AIassistant, options: { headerShown: true } },
  { name: 'Credit Lead', component: Lead, options: { headerShown: false } },
  { name: 'Credit WorkList', component: CreditWorkList, options: { headerShown: false } },
  { name: 'Applicationhistory', component: PreHistory, options: { headerShown: false } },
  { name: 'Success', component: SuccessPage },
  { name: 'MKC', component: FirstRoute },
  { name: 'ForgotpasswordPage', component: Forgotpassword, options: { headerShown: false } },
  { name: 'Viaemail', component: Viaemail, options: { headerShown: false } },
  { name: 'Tab Details', component: TabDetails, options: { headerShown: true } },
  { name: 'Tab Details Credit', component: TabDetailsCredit, options: { headerShown: true } },
  { name: 'Credit History', component: Credithistory, options: { headerShown: true } },
  { name: 'Document Store', component: ReviewDecision, options: { headerShown: true } },
  { name: 'Residence Verification', component: ResidenceVerificationProcess, options: { headerShown: true } },
  { name: 'Office Verifcation', component: OfficeVerifcationProcess, options: { headerShown: true } },
  { name: 'Personal Discussion', component: PersonalVerificationProcess, options: { headerShown: true } },
  { name: 'Verification Waiver', component: VerificationWaiverProcess, options: { headerShown: true } },
  { name: 'Update RCU', component: RCUProcess, options: { headerShown: true } },
  { name: 'Initiate RCU', component: InitaiateRCUProcess, options: { headerShown: true } },
  { name: 'Initiate Verification', component: InitiateverficationProcess, options: { headerShown: true } },
  { name: 'CreditWorklist Process', component: CreditWorkList, options: { headerShown: true } },
  { name: 'Decision ', component: DecisionProcess, options: { headerShown: true } },
  { name: 'NotificationPanel', component: NotificationPanel },
  { name: 'NotificationHistoryPanel', component: NotificationHistoryPanel },
];
