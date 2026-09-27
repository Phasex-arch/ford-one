// Barrel: re-exports every data module so screens can keep importing from
// a single '.../constants/data' path, the same shape they used when this
// was one big file — while the data itself now lives organized by domain
// in this folder (state.js, home.js, vehicleScreen.js, healthScreen.js,
// scheduling.js, diagnosis.js, profile.js, dealerships.js, offers.js,
// history.js, keepOrTrade.js, newFord.js, assistant.js, recommendations.js,
// notifications.js, support.js, settings.js, user.js). Nav/route config
// (page list, groups, bottom-tab ids) lives in ../nav.js, not here — it's
// not app data, it's the same PAGES/GROUP_ORDER/BOTTOM_IDS shape as
// script.js, shared by TopBar's drawer and the "Mais" tab.
export * from './state';
export * from './costs';
export * from './user';
export * from './home';
export * from './vehicleScreen';
export * from './healthScreen';
export * from './scheduling';
export * from './diagnosis';
export * from './profile';
export * from './dealerships';
export * from './offers';
export * from './history';
export * from './keepOrTrade';
export * from './newFord';
export * from './assistant';
export * from './recommendations';
export * from './notifications';
export * from './support';
export * from './settings';
export * from './drivers';
