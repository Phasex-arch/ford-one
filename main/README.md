# Ford One — React + Vite + TypeScript + Sass

Migração do projeto Ford One para React + Vite, mantendo a interface original 100% idêntica.

## Stack

- **React 18**
- **Vite**
- **TypeScript**
- **Sass/SCSS**
- **React Router v6**

## Estrutura

```
src/
  app/          → App.tsx, routes.tsx
  modules/      → landing, escolher-acesso, concessionaria-login, acesso-mobile
  shared/       → hooks, utils, constants reutilizáveis
  styles/       → abstracts, base, themes, globals.scss
  assets/       → imagens, ícones, fontes
  main.tsx      → entry point
```

## Instalação

```bash
npm install
npm run dev
```

## Assets

Coloque o arquivo `logo-ford.png` em:
```
public/assets/images/logo/logo-ford.png
```

## Rotas

| Rota              | Módulo                  | Corresponde a         |
|-------------------|-------------------------|-----------------------|
| `/`               | landing                 | index.html            |
| `/escolher`       | escolher-acesso         | escolher.html         |
| `/concessionaria` | concessionaria-login    | concessionaria.html   |
| `/acesso-mobile`  | acesso-mobile           | app-mobile.html       |

## Credenciais (concessionaria)

- **Usuário:** Ford-PhaseX
- **Senha:** Ford
- **Redirect:** `../ford-one-concessionaria/`
