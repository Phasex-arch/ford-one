import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

/**
 * Componente raiz — renderiza as rotas do Ford One.
 */
export function App() {
  const element = useRoutes(routes);
  return element;
}
