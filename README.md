# NEXO Mobile

Loja mobile para comércio no Rio. O cliente escolhe o produto, vê o total em real, dólar e euro e simula o pagamento. O operador cadastra a vitrine, escaneia no caixa e acompanha as vendas. Projeto da disciplina PDM (ARA4711), Estácio 2026.2.

Equipe na tela de bem-vindo, depois do login: Lucas, Douglas, Freitas, Diego e Gabriel.

Para instalar e apresentar, siga o [`ONBOARDING.md`](./ONBOARDING.md).

---

## Rodar no computador

É o caminho da apresentação em sala. O app abre no navegador.

1. Node.js LTS e o arquivo `.env` na raiz do projeto (o mesmo pasta do `package.json`). O `.env` não vai para o Git. Peça o arquivo no grupo.
2. Na pasta do projeto:

```bash
npm install
```

Se o npm reclamar de dependência do React, rode `npm install --legacy-peer-deps`.

3. Suba o site:

```bash
npm run web
```

4. Abra **http://localhost:8081**.

Ao abrir, a primeira tela é sempre o login. O bem-vindo vem depois de entrar ou criar a conta.

Conferir tipos, no Windows:

```powershell
.\node_modules\.bin\tsc --noEmit
```

## Rodar no celular

O scanner de código de barras é teste de celular. No Chrome a câmera abre, mas não lê EAN com confiança.

1. Instale o Expo Go do SDK 54, não o da Play Store: https://expo.dev/go?sdkVersion=54&platform=android&device=true
2. Celular e PC na mesma rede Wi-Fi.
3. `npx expo start` e escaneie o QR code com o Expo Go.
4. Se as redes forem diferentes: `npx expo start --tunnel`.

iPhone não instala essa versão antiga do Expo Go. A apresentação no Android ou no navegador do computador.

Detalhes e a tabela de erros estão no [`ONBOARDING.md`](./ONBOARDING.md).

---

## Como apresentar

Feche o app ou a aba antes de começar. A primeira tela tem de ser o login.

1. **Conta.** Entre com o e-mail de teste ou crie uma conta na hora. E-mail de teste: `douglas@nexo.com`. A senha fica no grupo. A sessão continua aberta até sair no perfil.
2. **Bem-vindo.** Fundo em degradê, a logo **NEXO.**, **Bem-vindo** e os cinco nomes da equipe. **Continuar** segue. As curiosidades ficam na tela de início.
3. **Cliente.** O app abre comprando. Mostre a busca, um produto, o coração de favorito e o **+** no carrinho. No carrinho, **−** e **+** mudam a quantidade. O total aparece em real, dólar e euro.
4. **Pagamento.** Aba **Pagar**. Escolha PIX, cartão, vale refeição, vale alimentação ou dinheiro e conclua. Diga em voz alta que nenhum banco é acionado: é uma simulação para a banca ver o fluxo. Com itens no carrinho, a compra fica registrada. Sem itens, dá para simular um valor.
5. **Operador.** Abra os três traços e toque em **Entrar como operador**. Isso é de propósito, para a apresentação: a troca fica neste aparelho e não pede outra conta. Mostre **Novo produto**, a edição, **Escanear** e a aba **Vendas**.
6. **Perfil.** Foto da galeria, **Remover foto**, contagem de compras ou vendas e a lista de favoritos. O tema claro ou escuro também está nos três traços.

Volte para cliente pelos mesmos três traços antes de encerrar, se a próxima pessoa for mostrar a compra.

### O que falar se perguntarem

- A cotação vem de open.er-api.com, com cache de uma hora. A tela nunca chama a internet direto.
- Produto repetido soma quantidade. Não cria outra linha.
- Foto de perfil, favoritos e o modo operador ficam neste aparelho. A venda e o catálogo que o Firebase aceitar ficam na nuvem.
- Se o Firestore recusar gravar um produto, ele continua aparecendo neste aparelho para a demo não parar.

### O que não prometer

Não há cobrança real, estoque, frete calculado nem entrega rastreada. A frase do Rio é o recado da loja no início. O pagamento é ilustrativo.

---

## Stack

| O quê | Tecnologia |
|---|---|
| App | React Native + Expo SDK 54 (TypeScript) |
| Navegação | Expo Router |
| Conta | Firebase Auth (e-mail e senha, com criar conta) |
| Dados | Firebase Firestore |
| Cotação | open.er-api.com, só em `services/exchange.ts` |
| Câmera | `expo-camera` |
| Ícones | `lucide-react-native` |
| Estado | React Context (carrinho, tema, favoritos, papel, painel) |

## Telas

```
ABERTURA → LOGIN → INÍCIO
Cliente: Produtos, Carrinho, Pagar, Perfil
Operador: Produtos, Escanear, Vendas, Perfil
```

A confirmação antiga (`/confirmacao`) não é o fluxo da apresentação. A compra termina em **Pagar**.

## Firebase

`produtos`: `nome`, `preco_brl`, `codigo_barras`, `categoria` e, quando couber, `foto`.

`vendas`: `operador_id`, `created_at`, `total_brl`, `cotacao_usd`, `cotacao_eur`, `itens`, e no fluxo novo `forma_pagamento` (`pix`, `cartao`, `vale_refeicao`, `vale_alimentacao`, `dinheiro`) e `origem` (`compra` ou `caixa`).

Quem está logado lê os produtos. A venda é criada por quem está na sessão. O modo operador da demo não é um campo no Firebase.

Decisões antigas e as deste clone estão em [`specs/decisoes.md`](./specs/decisoes.md).
