# Marcela Stohler — landing page

Site estático de conversão (Google Ads → WhatsApp): [marcela.stohler.com.br](https://marcela.stohler.com.br).

WhatsApp já configurado: `(21) 98029-6263`.

## Publicar de graça no Cloudflare Pages

Não use GitHub Actions. O Pages escuta o GitHub sozinho.

1. Faça push deste repositório para [github.com/stohler/marcelapsi](https://github.com/stohler/marcelapsi.git) na branch `main`.
2. No Cloudflare: **Workers & Pages → Create → Connect to Git**.
3. Autorize o GitHub App e escolha `stohler/marcelapsi`.
4. Configuração de build:
   - Framework preset: **None**
   - Build command: *vazio*
   - Output directory: `/`
   - Production branch: `main`
5. O primeiro deploy gera algo como `marcelapsi.pages.dev`.
6. No projeto Pages: **Custom domains →** `marcela.stohler.com.br`.

Como `stohler.com.br` já está na zona Cloudflare, o CNAME é criado automaticamente. Não conecte o mesmo repositório duas vezes (integração nativa **e** Action).

Push na `main` = produção. Pull request = URL de preview.

Documentação: [Custom domains no Pages](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Google Ads (quando a campanha existir)

Em [`site.config.js`](site.config.js), preencha:

```js
ads: {
  measurementId: "AW-XXXXXXXXX",
  conversionId: "AW-XXXXXXXXX",
  conversionLabel: "abcDEFghijk",
}
```

O clique em qualquer botão de WhatsApp dispara `generate_lead` e, se o label estiver preenchido, o evento `conversion`. Enquanto os campos estiverem vazios, nenhum script do Google é carregado.

Parâmetros `utm_source`, `utm_medium` e `utm_campaign` entram na mensagem pré-preenchida do WhatsApp.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `index.html` | Landing |
| `privacidade.html` | Política curta (LGPD / Ads) |
| `site.config.js` | WhatsApp, CRP, Instagram, IDs do Ads |
| `main.js` | Link `wa.me` + conversão |
| `styles.css` | Layout |
| `images/` | Retrato, OG, ilustrações |
