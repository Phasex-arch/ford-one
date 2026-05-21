import type { RouteObject } from 'react-router-dom';
import { ROUTES } from '../shared/constants/routes';
import { LandingScreen }             from '../modules/landing/landing.screen';
import { EscolherAcessoScreen }      from '../modules/escolher-acesso/escolher-acesso.screen';
import { ConcessionariaLoginScreen } from '../modules/concessionaria-login/concessionaria-login.screen';
import { AcessoMobileScreen }        from '../modules/acesso-mobile/acesso-mobile.screen';

export const routes: RouteObject[] = [
  { path: ROUTES.HOME,           element: <LandingScreen /> },
  { path: ROUTES.ESCOLHER,       element: <EscolherAcessoScreen /> },
  { path: ROUTES.CONCESSIONARIA, element: <ConcessionariaLoginScreen /> },
  { path: ROUTES.ACESSO_MOBILE,  element: <AcessoMobileScreen /> },
];
