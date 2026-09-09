# Ford One — Portal da Concessionária

React + Vite + TypeScript + Sass

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy no GitHub Pages

### 1. Crie o repositório no GitHub

Vá em github.com → New repository → nome: `ford-one` (ou o nome que quiser)

### 2. Ajuste o nome do repositório no workflow

Abra `.github/workflows/deploy.yml` e altere:

```yaml
VITE_BASE: /ford-one/   # ← coloque /nome-do-seu-repo/
```

Se for usar domínio próprio (CNAME), remova essa linha e deixe `VITE_BASE` sem valor.

### 3. Suba o código

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ford-one.git
git push -u origin main
```

### 4. Ative o GitHub Pages

No repositório → Settings → Pages → Source: **GitHub Actions**

O site será publicado automaticamente em cada push na branch `main`.

### Logo da Ford

Coloque o arquivo `icon_ford_one.png` em:
```
public/assets/images/logo/icon_ford_one.png
```

## Estrutura

```
src/
  app/          → App.tsx (root)
  modules/      → 14 telas (dashboard, clientes, historico...)
  shared/       → componentes, hooks, utils, layout
  styles/       → Sass (tema, globals, abstracts)
  data/         → dados mockados
  types/        → global.types.ts
```
