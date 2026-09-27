import React from 'react';
import MaintenanceBody from '../components/MaintenanceBody';

// Stacked route (native header "Manutenções" + back arrow, from
// app/_layout.js) — reached from "Ver todas" / quick-action links
// elsewhere. Same content as the "Serviços" bottom tab; see MaintenanceBody.
export default function MaintenanceScreen() {
  return <MaintenanceBody />;
}
