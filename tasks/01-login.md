# Checklist — Card 01 Login (`tela/login`)

Spec: `specs/01-login.md`. Marque cada item ao concluir.

- [x] L-01 E-mail com teclado `email-address`
- [x] L-02 Senha com `secureTextEntry`
- [x] L-03 "Entrar" chama `login(email, password)`
- [x] L-04 Loading enquanto processa
- [x] L-05 Erro legível para credenciais erradas
- [x] L-06 Sucesso → `router.replace('/caixa')`
- [x] L-07 Sessão ativa → direto para `/caixa`
- [x] L-08 "Entrar" desabilitado com campo vazio
- [x] L-09 "Criar conta" abre o modo de cadastro com confirmação de senha
- [x] L-10 Cadastro chama `cadastrar(email, password)`
- [ ] L-11 Loading e botão desabilitado durante o cadastro (o botão já desabilita no código; o spinner ainda não foi visto num envio real)
- [x] L-12 Senha curta ou diferente não chama o Firebase
- [ ] L-13 Sucesso → `/caixa` já autenticado (falta um e-mail novo de verdade)
- [ ] L-14 Erro de cadastro em português vindo do Firebase (a tela já mapeia o código; falta ver a resposta real)

Fechamento:

- [x] Nenhum non-goal implementado
- [x] `npx tsc --noEmit` passa
- [x] Validado pelos passos de "Como validar"
- [x] `/revisar` APROVADO
- [ ] PR aberto para `main`
