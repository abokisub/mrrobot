/* eslint-disable no-unused-vars */
import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import DashboardLayout from '../layouts/dashboard';
import AdminLayout from '../layouts/admin';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
import DocsLayout from '../layouts/doc';
import MainLayout from '../layouts/main';
// guards
import GuestGuard from '../guards/GuestGuard';
import CustomerGuard from '../guards/customerGuard';
import AuthGuard from '../guards/AuthGuard';
import RestGuard from '../guards/resend';
import RoleBasedGuard from '../guards/RoleBasedGuard';
// config
import { PATH_AFTER_LOGIN, PATH_AFTER_ADMIN, PATH_AFTER_DOCS } from './config';
// components
import LoadingScreen from './components/LoadingScreen';



// ------------------------------------------------------------- ---------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        {
          path: 'register/:name',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
        {
          path: 'verify',
          element: (
            <RestGuard>
              <VerifyCode />
            </RestGuard>
          ),
        },
        { path: 'reset-password', element: <ResetPassword /> },


      ],
    },
    // customer care Routes
    {
      path: 'customer',
      element: (
        <CustomerGuard>
          <DashboardLayout />
        </CustomerGuard>
      ),
      children: [
        {
          path: 'customer',
          children: [
            { element: <Navigate to="/secure/customer/history" replace />, index: true },
            { path: 'data', element: <AdminDataTransaction /> },
            { path: 'history', element: <AdminTransactionHistory /> },
            { path: 'airtime', element: <AdminAirtimeTransaction /> },
            { path: 'cable', element: <AdminCableTransaction /> },
            { path: 'bill', element: <AdminBillTransaction /> },
            { path: 'result', element: <AdminResultTransaction /> },
            { path: 'bulksms', element: <AdminBulkTransaction /> },
            { path: 'airtimecash', element: <AdminAirtimeCashTransaction /> },
            { path: 'stock', element: <AdminStockTransaction /> },
            { path: 'deposit', element: <AdminDepositTransaction /> },
            { path: 'manualfunding', element: <AdminManualTransfer /> },
            { path: 'data_card', element: <AdminDataCardTransaction /> },
            { path: 'recharge_card', element: <AdminRechargeCardTransaction /> }
          ]

        },
        { path: 'credit', element: <CreditUser /> }
      ]
    },

    // Dashboard Routes 
    {
      path: 'dashboard',
      element: (
        <AuthGuard>

          <DashboardLayout />

        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'app', element: <GeneralApp /> },
        { path: 'buydata', element: <BuyData /> },
        { path: 'buyairtime', element: <BuyAirtime /> },
        { path: 'buycable', element: <BuyCable /> },
        { path: 'buybill', element: <BuyBill /> },
        { path: 'device', element: <DownloadApp /> },
        { path: 'cash', element: <SellAirtime /> },
        { path: 'notif', element: <UserNotif /> },
        { path: 'bulksms', element: <BuyBulksms /> },
        { path: 'earning', element: <Earning /> },
        { path: 'exam', element: <BuyExam /> },
        { path: 'stock', element: <UserStockBalance /> },
        { path: 'calculator', element: <UserCal /> },
        { path: 'data_card', element: <BuyDataCard /> },
        { path: 'recharge_card', element: <BuyRechargeCard /> },

        {
          path: 'fund', children: [
            { element: <Navigate to="/dashboard/fund/account" replace />, index: true },
            { path: 'account', element: <Automated /> },
            { path: 'atm', element: <ATMfunding /> },
            { path: 'manual', element: <ManualBank /> },
            { path: 'paystack', element: <Paystackfunding /> },
            { path: 'update-kyc', element: <UpdateKYC /> },
            { path: 'dynamic-account', element: <DynamicAccount /> }
          ]
        },
        { path: 'pricing', element: <Pricing /> },
        {
          path: 'trans',
          children: [
            { element: <Navigate to="/dashboard/trans/history" replace />, index: true },
            { path: 'data', element: <DataTransaction /> },
            { path: 'history', element: <AllTransactionHistory /> },
            { path: 'airtime', element: <AirtimeTransation /> },
            { path: 'cable', element: <CableTransaction /> },
            { path: 'bill', element: <BillTransaction /> },
            { path: 'result', element: <ResultTransaction /> },
            { path: 'bulksms', element: <BulkSMSTransaction /> },
            { path: 'stock', element: <StockTransaction /> },
            { path: 'airtimecash', element: <AirtimeCashTransaction /> },
            { path: 'deposit', element: <DepositTransaction /> },
            { path: 'manualfunding', element: <ManualTransfer /> },
            { path: 'data_card', element: <DataCardTransaction /> },
            { path: 'recharge_card', element: <RechargeCardTransaction /> }
          ]
        },
        {
          path: 'invoice',
          children: [
            { element: <Navigate to="/dashboard/app" replace />, index: true },
            { path: ':name/data', element: <DataInvoice /> },
            { path: ':name/airtime', element: <AirtimeInvoice /> },
            { path: ':name/deposit', element: <DepositInvoice /> },
            { path: ':name/cable', element: <CableInvoice /> },
            { path: ':name/bill', element: <BillInvoice /> },
            { path: ':name/airtimecash', element: <CashInvoice /> },
            { path: ':name/bulksms', element: <BulksmsInvoice /> },
            { path: ':name/result', element: <ResultInvoice /> },
            { path: ':name/manual', element: <ManualInvoice /> },
            { path: ':name/data_card', element: <DataCardInvoice /> },
            { path: ':name/success_data_card', element: <DataCardPrint /> },
            { path: ':name/recharge_card', element: <RechargeCardInvoice /> },
            { path: ':name/success_recharge_card', element: <RechargeCardPrint /> }
          ]
        },

        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/account" replace />, index: true },
            { path: 'account', element: <UserAccount /> },
          ],
        },

      ],
    },
    // admin routes

    {
      path: 'secure',
      element: (
        <AuthGuard>
          <RoleBasedGuard>
            <AdminLayout />
          </RoleBasedGuard>
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_ADMIN} replace />, index: true },
        { path: 'app', element: <AdminGeneralApp /> },
        // notif
        { path: 'notif', element: <AdminNotif /> },
        { path: 'info', element: <SystemInfo /> },
        { path: 'welcome', element: <WelcomeInfo /> },
        { path: 'feature', element: <Feature /> },
        { path: 'newfeature', element: <NewFeature /> },
        { path: 'appDownlod', element: <AdminDownloadApp /> },
        { path: 'newappDownload', element: <NewApp /> },
        { path: 'paymentKey', element: <PaymentKey /> },
        { path: 'calculator', element: <Cal /> },
        {
          path: 'sendmessage',
          children: [
            { element: <Navigate to="/secure/sendmessage/gmail" replace />, index: true },
            { path: 'gmail', element: <GmailNotif /> },
            { path: 'system', element: <SystemNotif /> },
            { path: 'bulksms', element: <BulksmsNotif /> }
          ]
        },
        // user path
        {
          path: 'users',
          children: [
            { element: <Navigate to="/secure/users/users-all" replace />, index: true },
            { path: 'users-all', element: <AllUserAccount /> },
            { path: 'newuser', element: <NewUser /> },
            { path: ':name/edit', element: <NewUser /> },
            { path: 'UserCredit', element: <CreditUser /> },
            { path: 'upgrade', element: <UpgradeUser /> },
            { path: 'resetpassword', element: <UserResetPassword /> },
            { path: 'autoAccount', element: <AdexAutomated /> },
            { path: 'userbank', element: <AdexUserBank /> },
            { path: 'banned', element: <AdexBannedNumber /> },
            { path: 'addbanned', element: <AdexBanned /> },
            { path: 'stock', element: <StockBalance /> }
          ],
        },
        {
          path: 'trans',
          children: [
            { element: <Navigate to="/secure/trans/history" replace />, index: true },
            { path: 'data', element: <AdminDataTransaction /> },
            { path: 'history', element: <AdminTransactionHistory /> },
            { path: 'airtime', element: <AdminAirtimeTransaction /> },
            { path: 'cable', element: <AdminCableTransaction /> },
            { path: 'bill', element: <AdminBillTransaction /> },
            { path: 'result', element: <AdminResultTransaction /> },
            { path: 'bulksms', element: <AdminBulkTransaction /> },
            { path: 'cash', element: <AdminAirtimeCashTransaction /> },
            { path: 'stock', element: <AdminStockTransaction /> },
            { path: 'deposit', element: <AdminDepositTransaction /> },
            { path: 'manual', element: <AdminManualTransfer /> },
            { path: 'data_card', element: <AdminDataCardTransaction /> },
            { path: 'recharge_card', element: <AdminRechargeCardTransaction /> }
          ]
        },
        {
          path: 'discount',
          children: [
            { element: <Navigate to="/secure/discount/airtime" replace />, index: true },
            { path: 'airtime', element: <AirtimeDiscount /> },
            { path: 'cash', element: <CashDiscount /> },
            { path: 'bill', element: <BillCharges /> },
            { path: 'exam', element: <ResultCharges /> },
            { path: 'cable', element: <CableCharges /> },
            { path: 'other', element: <OtherCharge /> },
          ]
        },
        {
          path: 'lock',
          children: [
            { element: <Navigate to="/secure/lock/data" replace />, index: true },
            { path: 'airtime', element: <AirtimeLock /> },
            { path: 'data', element: <DataLock /> },
            { path: 'cable', element: <CableLock /> },
            { path: 'result', element: <ResultLock /> },
            { path: 'other', element: <OtherLock /> },
            { path: 'data_card', element: <DataCardLock /> },
            { path: 'recharge_card', element: <RechargeCardLock /> }
          ]
        },
        {
          path: 'plan',
          children: [
            { element: <Navigate to="/secure/plan/data" replace />, index: true },
            { path: 'data', element: <DataPlan /> },
            { path: 'bill', element: <BillPlan /> },
            { path: 'cable', element: <CablePlan /> },
            { path: 'exam', element: <ResultPlan /> },
            { path: 'network', element: <NetworkPlan /> },
            { path: 'newdata', element: <NewDataPlan /> },
            { path: ':name/editdata', element: <NewDataPlan /> },
            { path: 'newcable', element: <NewCablePlan /> },
            { path: ':name/editcable', element: <NewCablePlan /> },
            { path: 'newbill', element: <NewBillPlan /> },
            { path: ':name/editbill', element: <NewBillPlan /> },
            { path: ':name/editnetwork', element: <NetworkEdit /> },
            { path: ':name/editresult', element: <NewResult /> },
            { path: 'newresult', element: <NewResult /> },
            { path: 'data_card_plan', element: <DataCardPlan /> },
            { path: 'store_data_card', element: <StoreDataCardPlan /> },
            { path: 'recharge_card_plan', element: <RechargeCardPlan /> },
            { path: 'store_recharge_card', element: <StoreRechargeCardPlan /> },
            { path: 'new_data_card_plan', element: <NewDataCardPlan /> },
            { path: ':name/edit_data_card_plan', element: <NewDataCardPlan /> },
            { path: 'new_recharge_card_plan', element: <NewRechargeCardPlan /> },
            { path: ':name/edit_recharge_card_plan', element: <NewRechargeCardPlan /> },
            { path: 'add_store_data_card', element: <AddStoreDataCard /> },
            { path: ':name/edit_store_data_card', element: <AddStoreDataCard /> },
            { path: 'add_store_recharge_card', element: <AddStoreRechargeCard /> },
            { path: ':name/edit_store_recharge_card', element: <AddStoreRechargeCard /> },
          ]
        },
        {
          path: 'api',
          children: [
            { element: <Navigate to="/secure/api/adex" replace />, index: true },
            { path: 'adex', element: <AdexApis /> },
            { path: 'msorg', element: <MsorgApi /> },
            { path: 'virus', element: <VirusApi /> },
            { path: 'other', element: <OtherApi /> },
            { path: 'web', element: <WebApi /> }
          ]
        },
        {
          path: 'selection',
          children: [
            { element: <Navigate to="/secure/selection/data" replace />, index: true },
            { path: 'data', element: <DataSel /> },
            { path: 'airtime', element: <AirtimeSel /> },
            { path: 'cable', element: <CableSel /> },
            { path: 'bill', element: <BillSel /> },
            { path: 'bulksms', element: <BulkSel /> },
            { path: 'exam', element: <ExamSel /> },
            { path: 'data_card', element: <DataCardSel /> },
            { path: 'recharge_card', element: <RechargeCardSel /> },
          ]
        },
        {
          path: 'bellbank',
          children: [
            { element: <Navigate to="/secure/bellbank/accounts" replace />, index: true },
            { path: 'accounts', element: <BellBankAccounts /> },
            { path: 'transactions', element: <BellBankTransactions /> },
            { path: 'banks', element: <BellBankBanks /> },
            { path: 'name-enquiry', element: <BellBankNameEnquiry /> },
            { path: 'transfers', element: <BellBankTransfers /> },
            { path: 'kyc', element: <BellBankKYC /> },
            { path: 'webhooks', element: <BellBankWebhooks /> },
            { path: 'settings', element: <BellBankSettings /> },
          ]
        }
      ],
    },

    {
      path: 'documentation',
      element: (
        <AuthGuard>
          <DocsLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_DOCS} replace />, index: true },
        { path: 'home', element: <DocsHome /> },
        { path: 'data', element: <DocsData /> },
        { path: 'airtime', element: <DocsAirtime /> },
        { path: 'cable', element: <DocsCable /> },
        { path: 'bill', element: <DocsBill /> },
        { path: 'exam', element: <DocsExam /> },
        { path: 'bulksms', element: <DocsBulksms /> },
        { path: 'verify/iuc', element: <DocsIUC /> },
        { path: 'verify/meter', element: <DocsMeter /> },
        { path: 'webhook', element: <DocsWebhook /> },
        { path: 'data_card', element: <DocsDataCard /> },
        { path: 'recharge_card', element: <DocsRechargeCard /> }


      ]
    },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoon /> },
        { path: 'maintenance', element: <Maintenance /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: 'resetpassword/verify/adex/:name/reset', element: <ChangePassword /> },
    {
      // path: '/',
      // element: <MainLayout />,
      // children: [
      //   { element: <HomePage />, index: true },
      //   // { path: 'about-us', element: <About /> },
      //   // { path: 'contact-us', element: <Contact /> },
      //   // { path: 'faqs', element: <Faqs /> },
      // ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
    { path: '/', element: <Navigate to="/auth/login" replace /> },
  ]);
}

// IMPORT COMPONENTS
// docs
const DocsHome = Loadable(lazy(() => import('../pages/docs/home')));
const DocsData = Loadable(lazy(() => import('../pages/docs/data')));
const DocsAirtime = Loadable(lazy(() => import('../pages/docs/airtime')));
const DocsCable = Loadable(lazy(() => import('../pages/docs/cable')));
const DocsBill = Loadable(lazy(() => import('../pages/docs/bill')));
const DocsExam = Loadable(lazy(() => import('../pages/docs/exam')));
const DocsBulksms = Loadable(lazy(() => import('../pages/docs/bulksms')));
const DocsIUC = Loadable(lazy(() => import('../pages/docs/verifyiuc')));
const DocsMeter = Loadable(lazy(() => import('../pages/docs/meter')));
const DocsWebhook = Loadable(lazy(() => import('../pages/docs/webhook')));
const DocsDataCard = Loadable(lazy(() => import('../pages/docs/data_card')));
const DocsRechargeCard = Loadable(lazy(() => import('../pages/docs/recharge_card')));
// Authentication
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const VerifyCode = Loadable(lazy(() => import('../pages/auth/VerifyCode')));
// admin Dashboard 
const AdminGeneralApp = Loadable(lazy(() => import('../pages/admin/app')));
const AllUserAccount = Loadable(lazy(() => import('../pages/admin/UserAccount')));
const NewUser = Loadable(lazy(() => import('../pages/admin/NewUser')));
const CreditUser = Loadable(lazy(() => import('../pages/admin/creditUser')));
const UpgradeUser = Loadable(lazy(() => import('../pages/admin/upgradeUser')));
const UserResetPassword = Loadable(lazy(() => import('../pages/admin/resetpassword')));
const AdexAutomated = Loadable(lazy(() => import('../pages/admin/Automated')));
const AdexUserBank = Loadable(lazy(() => import('../pages/admin/UserBank')));
const AdexBannedNumber = Loadable(lazy(() => import('../pages/admin/bannedNumber')));
const AdexBanned = Loadable(lazy(() => import('../pages/admin/addbanned')));
const AirtimeDiscount = Loadable(lazy(() => import('../pages/admin/airtimediscount')));
const CableCharges = Loadable(lazy(() => import('../pages/admin/cablecharges')));
const BillCharges = Loadable(lazy(() => import('../pages/admin/billcharges')));
const CashDiscount = Loadable(lazy(() => import('../pages/admin/cashdiscount')));
const ResultCharges = Loadable(lazy(() => import('../pages/admin/resultcharge')));
const OtherCharge = Loadable(lazy(() => import('../pages/admin/othercharge')));
const AirtimeLock = Loadable(lazy(() => import('../pages/admin/airtimelock')));
const DataLock = Loadable(lazy(() => import('../pages/admin/datalock')));
const CableLock = Loadable(lazy(() => import('../pages/admin/cablelock')));
const ResultLock = Loadable(lazy(() => import('../pages/admin/resultlock')));
const OtherLock = Loadable(lazy(() => import('../pages/admin/otherlock')));
const DataPlan = Loadable(lazy(() => import('../pages/admin/dataplan')));
const NewDataPlan = Loadable(lazy(() => import('../pages/admin/newdataplan')));
const CablePlan = Loadable(lazy(() => import('../pages/admin/cableplan')));
const NewCablePlan = Loadable(lazy(() => import('../pages/admin/newcableplan')));
const BillPlan = Loadable(lazy(() => import('../pages/admin/billplan')));
const NewBillPlan = Loadable(lazy(() => import('../pages/admin/newbillplan')));
const NetworkPlan = Loadable(lazy(() => import('../pages/admin/networkplan')));
const NetworkEdit = Loadable(lazy(() => import('../pages/admin/editnetwork')));
const StockBalance = Loadable(lazy(() => import('../pages/admin/stockbalance')));
const AdexApis = Loadable(lazy(() => import('../pages/admin/adexapi')));
const MsorgApi = Loadable(lazy(() => import('../pages/admin/msorgapi')));
const VirusApi = Loadable(lazy(() => import('../pages/admin/virusapi')));
const OtherApi = Loadable(lazy(() => import('../pages/admin/otherapi')));
const WebApi = Loadable(lazy(() => import('../pages/admin/weburl')));
const ResultPlan = Loadable(lazy(() => import('../pages/admin/resultplan')));
const NewResult = Loadable(lazy(() => import('../pages/admin/newresult')));
const AdminNotif = Loadable(lazy(() => import('../pages/admin/notif')));
const DataSel = Loadable(lazy(() => import('../pages/admin/datasel')));
const AirtimeSel = Loadable(lazy(() => import('../pages/admin/airtimesel')));
const CableSel = Loadable(lazy(() => import('../pages/admin/cablesel')));
const BillSel = Loadable(lazy(() => import('../pages/admin/billsel')));
const BulkSel = Loadable(lazy(() => import('../pages/admin/bulksmssel')));
const ExamSel = Loadable(lazy(() => import('../pages/admin/examsel')));
const SystemInfo = Loadable(lazy(() => import('../pages/admin/systeminfo')));
const WelcomeInfo = Loadable(lazy(() => import('../pages/admin/welcome')));
const Feature = Loadable(lazy(() => import('../pages/admin/feature')));
const NewFeature = Loadable(lazy(() => import('../pages/admin/newfeature')));
const AdminDownloadApp = Loadable(lazy(() => import('../pages/admin/appDownload')));
const NewApp = Loadable(lazy(() => import('../pages/admin/newapp')));
const PaymentKey = Loadable(lazy(() => import('../pages/admin/paymentkey')))
const GmailNotif = Loadable(lazy(() => import('../pages/admin/gmail')))
const SystemNotif = Loadable(lazy(() => import('../pages/admin/systemnotif')));
const BulksmsNotif = Loadable(lazy(() => import('../pages/admin/bulksms')));
const Cal = Loadable(lazy(() => import('../pages/admin/cal')));
const DataCardPlan = Loadable(lazy(() => import('../pages/admin/data_card_plan')));
const NewDataCardPlan = Loadable(lazy(() => import('../pages/admin/new_data_plan_card')))
const NewRechargeCardPlan = Loadable(lazy(() => import('../pages/admin/new_recharge_card_plan')));
const RechargeCardPlan = Loadable(lazy(() => import('../pages/admin/recharge_card_plan')));
const StoreDataCardPlan = Loadable(lazy(() => import('../pages/admin/store_data_card')));
const AddStoreDataCard = Loadable(lazy(() => import('../pages/admin/add_store_data_card')));
const StoreRechargeCardPlan = Loadable(lazy(() => import('../pages/admin/store_recharge_card')));
const AddStoreRechargeCard = Loadable(lazy(() => import('../pages/admin/add_store_recharge_card')));
const DataCardLock = Loadable(lazy(() => import('../pages/admin/data_card_lock')));
const RechargeCardLock = Loadable(lazy(() => import('../pages/admin/recharge_card_lock')));
const DataCardSel = Loadable(lazy(() => import('../pages/admin/data_card_sel')));
const RechargeCardSel = Loadable(lazy(() => import('../pages/admin/recharge_card_sel')));
// BellBank
const BellBankAccounts = Loadable(lazy(() => import('../pages/admin/bellbank/accounts')));
const BellBankTransactions = Loadable(lazy(() => import('../pages/admin/bellbank/transactions')));
const BellBankBanks = Loadable(lazy(() => import('../pages/admin/bellbank/banks')));
const BellBankNameEnquiry = Loadable(lazy(() => import('../pages/admin/bellbank/name-enquiry')));
const BellBankTransfers = Loadable(lazy(() => import('../pages/admin/bellbank/transfers')));
const BellBankKYC = Loadable(lazy(() => import('../pages/admin/bellbank/kyc')));
const BellBankWebhooks = Loadable(lazy(() => import('../pages/admin/bellbank/webhooks')));
const BellBankSettings = Loadable(lazy(() => import('../pages/admin/bellbank/settings')));
// admin transaction 
const AdminTransactionHistory = Loadable(lazy(() => import('../pages/admin/trans/transhistory')));
const AdminDataTransaction = Loadable(lazy(() => import('../pages/admin/trans/datatrans')));
const AdminStockTransaction = Loadable(lazy(() => import('../pages/admin/trans/stocktrans')));
const AdminAirtimeTransaction = Loadable(lazy(() => import('../pages/admin/trans/airtimetrans')));
const AdminCableTransaction = Loadable(lazy(() => import('../pages/admin/trans/cabletrans')));
const AdminBillTransaction = Loadable(lazy(() => import('../pages/admin/trans/billtrans')));
const AdminResultTransaction = Loadable(lazy(() => import('../pages/admin/trans/resulttrans')));
const AdminBulkTransaction = Loadable(lazy(() => import('../pages/admin/trans/bulksms')));
const AdminAirtimeCashTransaction = Loadable(lazy(() => import('../pages/admin/trans/cash')));
const AdminDepositTransaction = Loadable(lazy(() => import('../pages/admin/trans/deposittrans')));
const AdminManualTransfer = Loadable(lazy(() => import('../pages/admin/trans/manual')));
const AdminDataCardTransaction = Loadable(lazy(() => import('../pages/admin/trans/data_card')));
const AdminRechargeCardTransaction = Loadable(lazy(() => import('../pages/admin/trans/recharge_card')));
// Dashboard
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));
const UserNotif = Loadable(lazy(() => import('../pages/dashboard/notif')));
const UserAccount = Loadable(lazy(() => import('../pages/dashboard/UserAccount')));
const UserStockBalance = Loadable(lazy(() => import('../pages/dashboard/stockbalance')));
const DownloadApp = Loadable(lazy(() => import('../pages/dashboard/appdownload')));
const UserCal = Loadable(lazy(() => import('../pages/dashboard/cal')));
const Automated = Loadable(lazy(() => import('../pages/dashboard/automated')));
const ManualBank = Loadable(lazy(() => import('../pages/dashboard/banktransfer')));
const ATMfunding = Loadable(lazy(() => import('../pages/dashboard/atm')));
const UpdateKYC = Loadable(lazy(() => import('../pages/dashboard/kyc')));
const DynamicAccount = Loadable(lazy(() => import('../pages/dashboard/dynamic_account')));
const Paystackfunding = Loadable(lazy(() => import('../pages/dashboard/paystack')));
const BuyDataCard = Loadable(lazy(() => import('../pages/dashboard/datacard')));
const BuyRechargeCard = Loadable(lazy(() => import('../pages/dashboard/rechargecard')));
// transaction history

const AllTransactionHistory = Loadable(lazy(() => import('../pages/dashboard/history')));
const DataTransaction = Loadable(lazy(() => import('../pages/dashboard/datatrans')));
const AirtimeTransation = Loadable(lazy(() => import('../pages/dashboard/airtimetrans')));
const DepositTransaction = Loadable(lazy(() => import('../pages/dashboard/deposittrans')));
const CableTransaction = Loadable(lazy(() => import('../pages/dashboard/cabletrans')));
const BillTransaction = Loadable(lazy(() => import('../pages/dashboard/billtrans')));
const AirtimeCashTransaction = Loadable(lazy(() => import('../pages/dashboard/cashtrans')));
const StockTransaction = Loadable(lazy(() => import('../pages/dashboard/stocktrans')));
const BulkSMSTransaction = Loadable(lazy(() => import('../pages/dashboard/bulksmstrans')));
const ManualTransfer = Loadable(lazy(() => import('../pages/dashboard/bankfunding')));
const ManualInvoice = Loadable(lazy(() => import('../pages/dashboard/bankinvoice')));
const Pricing = Loadable(lazy(() => import('../pages/dashboard/price')));
const DataCardTransaction = Loadable(lazy(() => import('../pages/dashboard/data_card_p')));
const RechargeCardInvoice = Loadable(lazy(() => import('../pages/dashboard/recharge_card_p')));
const RechargeCardTransaction = Loadable(lazy(() => import('../pages/dashboard/recharge_card_trans')));

// invioce
const DataInvoice = Loadable(lazy(() => import('../pages/dashboard/datainvioce')));
const AirtimeInvoice = Loadable(lazy(() => import('../pages/dashboard/airtimeinvoice')));
const DepositInvoice = Loadable(lazy(() => import('../pages/dashboard/depositinvoice')));
const CableInvoice = Loadable(lazy(() => import('../pages/dashboard/cableinvoice')));
const BillInvoice = Loadable(lazy(() => import('../pages/dashboard/billinvoice')));
const CashInvoice = Loadable(lazy(() => import('../pages/dashboard/cashinvoice')));
const BulksmsInvoice = Loadable(lazy(() => import('../pages/dashboard/bulksmsinvoice')));
const ResultInvoice = Loadable(lazy(() => import('../pages/dashboard/resultinvoice')));
const DataCardInvoice = Loadable(lazy(() => import('../pages/dashboard/data_card_invoice')));
const DataCardPrint = Loadable(lazy(() => import('../pages/dashboard/data_card_success')));
const RechargeCardPrint = Loadable(lazy(() => import('../pages/dashboard/recharge_card_succes')));
// purchase
const BuyData = Loadable(lazy(() => import('../pages/dashboard/buydata')));
const BuyAirtime = Loadable(lazy(() => import('../pages/dashboard/buyairtime')));
const BuyCable = Loadable(lazy(() => import('../pages/dashboard/buycable')));
const BuyBill = Loadable(lazy(() => import('../pages/dashboard/buybill')));
const SellAirtime = Loadable(lazy(() => import('../pages/dashboard/sellairtime')));
const BuyBulksms = Loadable(lazy(() => import('../pages/dashboard/buybulksms')));
const Earning = Loadable(lazy(() => import('../pages/dashboard/earning')));
const BuyExam = Loadable(lazy(() => import('../pages/dashboard/buyexam')));
const ResultTransaction = Loadable(lazy(() => import('../pages/dashboard/resulttrans')));
// Main

const ComingSoon = Loadable(lazy(() => import('../pages/ComingSoon')));
const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')));
const HomePage = Loadable(lazy(() => import('../pages/home')))
const Page500 = Loadable(lazy(() => import('../pages/Page500')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
const ChangePassword = Loadable(lazy(() => import('../pages/resetpassword')));





