// Core reactive vehicle state: vehicle, vehicleHealth, alerts and
// maintenance for the ACTIVE vehicle, plus the garage of vehicles the user
// can switch between.
//
// The actual bindings live in ./shared.js (a dependency-free module) — see
// the comment at the top of that file for why: it breaks a require cycle
// this file used to be part of (state.js <-> history.js <-> costs.js,
// state.js <-> vehicleScreen.js) without changing any behavior. This file
// just re-exports the same names so every existing
// `import { vehicle, ... } from '.../constants/data'` (or './state')
// elsewhere in the app keeps working unchanged.
//
// vehicle/vehicleHealth/alerts/maintenance/tirePositions are `let` bindings
// reassigned wholesale by loadVehicleBundleData() (in shared.js) when
// switching vehicles — only the module that declares `export let x` can
// reassign x in JavaScript, so screens that display live data subscribe to
// AppStateContext's `vehicleVersion` counter (bumped by switchVehicle) to
// know when to re-render and re-read these values after a switch.
export {
  vehicle,
  vehicleHealth,
  alerts,
  tirePositions,
  maintenance,
  garage,
  loadVehicleBundleData,
} from './shared';
