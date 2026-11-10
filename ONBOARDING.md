# Onboarding — NEXO Mobile

Como instalar, abrir e apresentar o app. A apresentação da faculdade cabe no navegador do computador. O celular entra quando forem mostrar o scanner.

---

## 1. Pré-requisitos

- Node.js LTS — [nodejs.org](https://nodejs.org)
- Git
- O arquivo `.env` do grupo (não está no GitHub)
- Para o celular: Android e o Expo Go do SDK 54

## 2. Instalar

```bash
git clone https://github.com/oliveiiradg/Nexo-Mobile.git
cd Nexo-Mobile
npm install
```

Se aparecer erro de dependência do React (`ERESOLVE`), rode de novo com `npm install --legacy-peer-deps`.

Coloque o `.env` na raiz, ao lado do `package.json`. Não commite esse arquivo.

## 3. Apresentar no computador

```bash
npm run web
```

Abra **http://localhost:8081**.

Antes de chamar a banca, feche a aba inteira e abra o endereço de novo. A primeira tela é sempre o login, mesmo que a conta já tenha entrado antes.

Depois de **Entrar** ou **Criar conta**, vem o bem-vindo: logo **NEXO.** e os nomes Lucas, Douglas, Freitas, Diego e Gabriel. **Continuar** abre a loja. As curiosidades aparecem só no início.

E-mail de teste: `douglas@nexo.com`. A senha está no grupo. Também dá para tocar em **Criar conta**. A senha precisa ter pelo menos 6 caracteres.

### Roteiro curto

1. Login ou criar conta.
2. Bem-vindo: logo e nomes da equipe. **Continuar**.
3. Como cliente: produto, favorito, carrinho e total em real, dólar e euro.
4. **Pagar**: PIX, cartão, vale refeição, vale alimentação ou dinheiro. Diga que é simulação.
5. Três traços → **Entrar como operador**. Cadastre ou edite um produto, abra **Vendas**.
6. Perfil: foto, remover foto, favoritos e sair.
7. Três traços de novo se quiser voltar ao cliente. O tema claro e o escuro estão no mesmo menu.

O papel de operador fica neste navegador de propósito, para a troca caber na apresentação sem outra conta.

## 4. Celular

O código de barras se mostra no Android.

1. Desinstale o Expo Go da loja, se ele for mais novo que o SDK 54.
2. Instale este: https://expo.dev/go?sdkVersion=54&platform=android&device=true
3. PC e celular na mesma Wi-Fi.
4. `npx expo start` e leia o QR code no Expo Go.
5. Redes diferentes: `npx expo start --tunnel`.

No celular, fechar o app de verdade é tirar ele da lista de recentes. Aí o login aparece de novo. Só bloquear a tela não conta.

iPhone não instala essa versão do Expo Go. Use o navegador do computador ou um Android.

## 5. Durante a fala

- Cotação: serviço `services/exchange.ts`, cache de uma hora. Se aparecer "Cotação indisponível", a compra ainda pode ser simulada.
- Favoritos, foto de perfil e modo operador sobrevivem ao recarregar neste aparelho. Uma venda concluída com itens vai para o Firestore quando a regra deixa.
- Não diga que o PIX ou o cartão cobram de verdade.

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `Project is incompatible with this version of Expo Go` | Reinstalar o Expo Go pelo link do passo 4 |
| Tela branca no celular | Fechar o Expo Go na lista de recentes e ler o QR de novo |
| `npm install` quebra no React | `npm install --legacy-peer-deps` |
| Cotação indisponível | Esperar e seguir. A API gratuita limita rajada de pedidos |
| Câmera negada | Configurações do Android → Expo Go → Câmera → Permitir |
| O login não é a primeira tela | Fechar a aba ou o app por completo e abrir o endereço de novo |
| `npx tsc` instala um pacote errado | No Windows, usar `.\node_modules\.bin\tsc --noEmit` |

Dúvida de sala: grupo do WhatsApp. O mapa técnico do app está no [`README.md`](./README.md).
