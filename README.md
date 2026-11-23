[![Validação de PR](https://github.com/gustavoduarte77/portfolio-devops/actions/workflows/ci.yml/badge.svg?event=pull_request)](https://github.com/gustavoduarte77/portfolio-devops/actions/workflows/ci.yml)
[![Publicação no GitHub Pages](https://github.com/gustavoduarte77/portfolio-devops/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/gustavoduarte77/portfolio-devops/actions/workflows/deploy.yml)

# Portfólio DevOps

Portfólio estático e esteira de integração e entrega contínua para GitHub Pages.

[Abrir o portfólio publicado](https://gustavoduarte77.github.io/portfolio-devops/)

## Rodar localmente

Abra `index.html` no navegador. Com Node.js 22 ou 24, execute:

```bash
npm ci
npm run lint
npm run check:links
bash scripts/check-files.sh
```

Edite o nome, as habilidades, os projetos e os endereços do GitHub e DEV Community em `index.html`. Guarde imagens em `images/`.

## Configurar o GitHub

1. Em **Settings → Pages**, selecione **GitHub Actions** como fonte de publicação.
2. Abra um pull request para `main` para que os checks sejam registrados pelo GitHub.
3. Em **Settings → Rules → Rulesets**, crie uma regra ativa para `main`, exija pull requests e os checks **Validação (Node 22)** e **Validação (Node 24)**. Exija que a branch esteja atualizada antes do merge.
4. Em **Settings → Secrets and variables → Actions**, cadastre a URL de um webhook do Discord com o nome `DISCORD_WEBHOOK_URL`. O workflow envia um link para a execução se o empacotamento ou a publicação falhar.
5. Em **Settings → Collaborators**, convide `09116428-collab`.

## Evidências da entrega

- Abra um PR de demonstração removendo a tag de fechamento de um título em `index.html`. Capture a execução vermelha e o check que bloqueia o merge.
- Corrija o HTML, aguarde os dois checks ficarem verdes e faça o merge. Capture a execução bem-sucedida do workflow de publicação.
- Registre a URL pública exibida no ambiente `github-pages`.

Referência: [Publicação automática no GitHub Pages](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically).
