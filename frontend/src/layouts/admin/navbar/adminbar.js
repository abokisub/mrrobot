// routes
import { PATH_DASHBOARD, PATH_ADMIN } from '../../../routes/paths';

import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

 
const ICONS = {
  user: getIcon('ic_user'),
  dashboard: getIcon('adex_home'),
  trans: getIcon('trans'),
  lock: getIcon('lock'),
  discount: getIcon('discount'),
  plan: getIcon('plan'),
  api: getIcon('api'),
  vend: getIcon('vend'),
  info: getIcon('info'),
  message: getIcon('message'),
  feature: getIcon('ads'),
  phone: getIcon('phone'),
  key: getIcon('key'),
  notif: getIcon('notif'),
  cal: getIcon('cal'),
  banking: getIcon('ic_banking')
};

const  adminConfig =  [
  // smart user dashboard
  // ----------------------------------------------------------------------
  {
    subheader: 'general',
    items: [
      {
        title: 'dashboard',
        icon: ICONS.dashboard,
        children: [
        {title: 'admin dashboard', path: PATH_ADMIN.general.app},
        {title: 'user dashboard', path: PATH_DASHBOARD.general.app}
        ]
      },
      {
        title: 'System info', icon: ICONS.info, path: PATH_ADMIN.general.info
      },
      {
        title: 'welcome message', icon:ICONS.message, path: PATH_ADMIN.general.message
      },
      {
        title: 'Feature Image', icon:ICONS.feature, path: PATH_ADMIN.general.feature
      },
      {
        title: 'Apps', icon:ICONS.phone, path: PATH_ADMIN.general.app_download
      },
      {
        title: 'Payment Key', icon:ICONS.key, path: PATH_ADMIN.general.payment_key
      },
      {
        title: 'Notification Sender',
        icon: ICONS.notif,
        path: PATH_ADMIN.sendmessage.root,
        children: [
          {title: 'gmail notification', path: PATH_ADMIN.sendmessage.gmail},
          {title: 'system notification', path: PATH_ADMIN.sendmessage.system},
          {title: 'bulksms notification', path: PATH_ADMIN.sendmessage.bulksms}
        ]
      },
      {
        title: 'transaction calculator', icon: ICONS.cal, path: PATH_ADMIN.general.calculator
      }
    
    ],
  },
  {
    subheader: 'management',
    items: [
      {
        title: 'users account',
        icon: ICONS.user,
        path: PATH_ADMIN.user.root,
        children: [
          {title: 'users', path: PATH_ADMIN.user.all_user},
          {title: 'create user', path: PATH_ADMIN.user.newUser},
          {title: 'Credit/Debit User', path: PATH_ADMIN.user.creditUser},
          {title: 'Upgrade/Downgrade User', path: PATH_ADMIN.user.upgradeuser},
          {title: 'Reset User Password', path: PATH_ADMIN.user.resetpassword},
          {title: 'Automated Bank Account Number', path: PATH_ADMIN.user.automedaccount},
          {title: 'User Account Details', path: PATH_ADMIN.user.userbank},
          {title: 'Banned Numbers', path: PATH_ADMIN.user.bannednumber},
          {title: 'stock balance', path: PATH_ADMIN.user.stockuser}
        ]
      },
      {
        title: 'transaction details',
        icon: ICONS.trans,
        path: PATH_ADMIN.trans.root,
        children: [
          {title: 'All Transaction History', path: PATH_ADMIN.trans.history},
          {title: 'data transaction', path: PATH_ADMIN.trans.data},
          {title: 'stock summary', path: PATH_ADMIN.trans.stock},
          {title: 'airtime transaction', path:PATH_ADMIN.trans.airtime},
          {title: 'cable transaction', path:PATH_ADMIN.trans.cable},
          {title: 'bill transaction', path: PATH_ADMIN.trans.bill},
          {title: 'result checker', path: PATH_ADMIN.trans.result},
          {title: 'bulk sms', path:PATH_ADMIN.trans.bulksms},
          {title: 'airtime 2 cash', path: PATH_ADMIN.trans.cash},
          {title: 'deposit transaction', path: PATH_ADMIN.trans.deposit},
          {title: 'manual funding', path: PATH_ADMIN.trans.manual},
          {title: 'data-card', path: PATH_ADMIN.trans.data_card},
          {title: 'recharge-card', path: PATH_ADMIN.trans.recharge_card}
        ]
      },
      {
        title: 'discount / charges',
        icon: ICONS.discount,
        path: PATH_ADMIN.discount.root,
        children: [
          {title: 'airtime discount', path: PATH_ADMIN.discount.airtime},
          {title: 'cable charges', path: PATH_ADMIN.discount.cable},
          {title: 'bill charges', path: PATH_ADMIN.discount.bill},
          {title: 'airtime 2 cash discount', path: PATH_ADMIN.discount.cash},
          {title: 'result checker charges', path: PATH_ADMIN.discount.exam},
          {title: 'other services', path: PATH_ADMIN.discount.other}
        ]
      },
      {
        title: 'lock / unclock services',
        icon: ICONS.lock,
        path: PATH_ADMIN.lock.root,
        children: [
          {title: 'airtime', path: PATH_ADMIN.lock.airtime},
          {title: 'data', path: PATH_ADMIN.lock.data},
          {title: 'cable', path: PATH_ADMIN.lock.cable},
          {title: 'result checker', path: PATH_ADMIN.lock.exam},
          {title: 'data-card', path: PATH_ADMIN.lock.data_card},
          {title: 'recharge-card', path: PATH_ADMIN.lock.recharge_card},
          {title: 'other services', path: PATH_ADMIN.lock.other}
        ]
      },{
        title: 'plan',
        icon:ICONS.plan,
        path: PATH_ADMIN.plan.root,
        children: [
          {title: 'data', path: PATH_ADMIN.plan.data},
          {title: 'cable', path: PATH_ADMIN.plan.cable},
          {title: 'bill', path:PATH_ADMIN.plan.bill},
          {title: 'store-result-pin', path: PATH_ADMIN.plan.exam},
          {title: 'network', path: PATH_ADMIN.plan.network},
          {title: 'data-card-plan', path: PATH_ADMIN.plan.data_card_plan},
          {title: 'store-data-card', path: PATH_ADMIN.plan.store_data_card},
          {title: 'recharge-card-plan', path: PATH_ADMIN.plan.recharge_card_plan},
          {title: 'store-recharge-card', path: PATH_ADMIN.plan.store_recharge_card}

        ]
      },
      {
        title: "API's",
        icon: ICONS.api,
        path: PATH_ADMIN.api.root,
        children: [
          {title: 'ADEX', path: PATH_ADMIN.api.adex},
          {title: 'MSORG', path: PATH_ADMIN.api.msorg},
          {title: 'VIRUS', path: PATH_ADMIN.api.virus},
          {title: 'OTHER', path: PATH_ADMIN.api.other},
          {title: 'WEB URL', path: PATH_ADMIN.api.web}
        ]
      },
      {
        title: "vending selection",
        icon: ICONS.vend,
        path: PATH_ADMIN.selection.root,
        children: [
          {title: 'data', path: PATH_ADMIN.selection.data},
          {title: 'airtime', path: PATH_ADMIN.selection.airtime},
          {title: 'cable', path: PATH_ADMIN.selection.cable},
          {title: 'bulksms', path: PATH_ADMIN.selection.bulksms},
          {title: 'bill', path: PATH_ADMIN.selection.bill},
          {title: 'result checker', path: PATH_ADMIN.selection.exam},
          {title: 'data-card', path: PATH_ADMIN.selection.data_card},
          {title: 'recharge-card', path: PATH_ADMIN.selection.recharge_card}
        ]
      },
      {
        title: 'BellBank',
        icon: ICONS.banking,
        path: PATH_ADMIN.bellbank.root,
        children: [
          {title: 'virtual accounts', path: PATH_ADMIN.bellbank.accounts},
          {title: 'transactions', path: PATH_ADMIN.bellbank.transactions},
          {title: 'banks list', path: PATH_ADMIN.bellbank.banks},
          {title: 'name enquiry', path: PATH_ADMIN.bellbank.name_enquiry},
          {title: 'transfers', path: PATH_ADMIN.bellbank.transfers},
          {title: 'KYC management', path: PATH_ADMIN.bellbank.kyc},
          {title: 'webhooks', path: PATH_ADMIN.bellbank.webhooks},
          {title: 'settings', path: PATH_ADMIN.bellbank.settings}
        ]
      }
    ]
  },
  
]
export default adminConfig;
