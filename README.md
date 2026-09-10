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

## Integração com a API

O portal e o painel usam `http://localhost:3000/api` por padrão. Para apontar
para outro ambiente, defina `VITE_API_BASE_URL` no ambiente do Vite:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

O formulário público usa `POST /public/leads`; o painel autentica via JWT e
consome dashboard, estoque, clientes e leads. A chave do Resend permanece
exclusivamente no backend.

## Assets

Coloque o arquivo `icon_ford_one.png` em:
```
public/assets/images/logo/icon_ford_one.png
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
