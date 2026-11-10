# Spec 01 — Tela de Login

**Branch:** `tela/login` · **Depende de:** scaffold pronto (`tasks/00-scaffold.md`) · **Checklist:** `tasks/01-login.md`

## Escopo de arquivos

- **Pode editar:** `app/login.tsx`
- **Pode importar (só leitura):** `services/auth.ts` (`login`, `cadastrar`, `observarSessao`), `expo-router`

## Comportamento

Primeira tela do app. O operador entra com e-mail e senha, ou cria a própria conta. Login ou cadastro OK → `/inicio`. Se já houver sessão ativa, vai direto para `/inicio`.

O cadastro usa `cadastrar(email, password)` (D-10). A confirmação de senha fica só na tela: o serviço recebe a senha uma vez. Com menos de 6 caracteres, ou com a confirmação diferente, a tela avisa em português e não chama o Firebase.

`app/index.tsx` (do Douglas) já roteia a abertura do app. A tela de Login também confere a sessão por conta própria, como pede o card. Os dois existem por design; não remova nenhum.

## Acceptance criteria

- **L-01** Campo de e-mail com teclado `email-address`
- **L-02** Campo de senha com `secureTextEntry`
- **L-03** Botão "Entrar" chama `login(email, password)`
- **L-04** Loading indicator enquanto o login processa
- **L-05** Mensagem de erro legível para e-mail/senha incorretos (nunca o erro técnico do Firebase)
- **L-06** Login com sucesso → `router.replace('/inicio')`
- **L-07** Sessão ativa ao abrir a tela → `/inicio` sem passar pelo login (via `observarSessao`, limpando a inscrição ao desmontar)
- **L-08** Botão "Entrar" desabilitado se algum campo estiver vazio
- **L-09** "Criar conta" alterna para o modo de cadastro, com campo "Confirmar senha"
- **L-10** Nesse modo, o botão principal chama `cadastrar(email, password)`
- **L-11** Loading e botão desabilitado enquanto o cadastro processa
- **L-12** Senha curta ou confirmação diferente mostra mensagem em português e não chama o Firebase
- **L-13** Cadastro com sucesso → `router.replace('/inicio')`, já autenticado
- **L-14** Falha de cadastro vira mensagem legível (nunca o erro técnico do Firebase)

## Non-goals

- Recuperação de senha
- Login social

## Mensagens de erro (sugestão)

Mapear `error.code` do Firebase para texto pt-BR:

| Código                                                     | Mensagem                                    |
|------------------------------------------------------------|---------------------------------------------|
| `auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found` | "E-mail ou senha incorretos."   |
| `auth/invalid-email`                                       | "E-mail inválido."                          |
| `auth/too-many-requests`                                   | "Muitas tentativas. Tente novamente em instantes." |
| `auth/network-request-failed`                              | "Sem conexão. Verifique a internet."        |
| qualquer outro                                             | "Não foi possível entrar. Tente novamente." |

No cadastro:

| Código                        | Mensagem                                      |
|-------------------------------|-----------------------------------------------|
| `auth/email-already-in-use`   | "Este e-mail já está cadastrado."             |
| `auth/invalid-email`          | "E-mail inválido."                            |
| `auth/weak-password`          | "A senha precisa ter pelo menos 6 caracteres." |
| `auth/too-many-requests`      | "Muitas tentativas. Tente novamente em instantes." |
| `auth/network-request-failed` | "Sem conexão. Verifique a internet."          |
| qualquer outro                | "Não foi possível criar a conta. Tente novamente." |

## Como validar

1. Usuário de teste criado no Firebase Console.
2. Campos vazios → botão desabilitado.
3. Senha errada → mensagem legível, sem texto técnico.
4. Credenciais corretas → vai para Caixa.
5. Fechar e reabrir o app logado → abre direto na Caixa.
6. Sem internet → mensagem de conexão.
7. "Criar conta" mostra a confirmação de senha. Senhas diferentes ou com menos de 6 caracteres não disparam o Firebase.
8. E-mail novo e senha válida → entra direto na Caixa.
9. E-mail já cadastrado → "Este e-mail já está cadastrado."
