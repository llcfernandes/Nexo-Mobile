import { router } from 'expo-router'
import { Lock, Mail, Moon, Sun } from 'lucide-react-native'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TextoVerde from '../components/TextoVerde'
import { useTema } from '../context/TemaContext'
import { cadastrar, login } from '../services/auth'

const SENHA_MINIMA = 6

type Modo = 'entrar' | 'criar'

const codigoDoErro = (e: unknown): string =>
  e instanceof Error && 'code' in e ? String((e as { code: unknown }).code) : ''

const mensagemDeLogin = (codigo: string): string => {
  switch (codigo) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.'
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente em instantes.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet.'
    default:
      return 'Não foi possível entrar. Tente novamente.'
  }
}

const mensagemDeCadastro = (codigo: string): string => {
  switch (codigo) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.'
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente em instantes.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet.'
    default:
      return 'Não foi possível criar a conta. Tente novamente.'
  }
}

export default function Login() {
  const { tema, cores, alternarTema } = useTema()
  const [modo, setModo] = useState<Modo>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const senhaCurta = modo === 'criar' && senha.length > 0 && senha.length < SENHA_MINIMA
  const senhasDiferentes = modo === 'criar' && confirmar.length > 0 && senha !== confirmar
  const desabilitado =
    !email.trim() ||
    !senha ||
    carregando ||
    (modo === 'criar' && (!confirmar || senha.length < SENHA_MINIMA || senha !== confirmar))

  const alternarModo = () => {
    setModo((atual) => (atual === 'entrar' ? 'criar' : 'entrar'))
    setConfirmar('')
    setErro(null)
  }

  const handleEntrar = async () => {
    setErro(null)
    setCarregando(true)
    try {
      await login(email.trim(), senha)
      router.replace('/boas-vindas')
    } catch (e) {
      console.error('[login] falha ao entrar:', e)
      setErro(mensagemDeLogin(codigoDoErro(e)))
    } finally {
      setCarregando(false)
    }
  }

  const handleCriar = async () => {
    if (senha.length < SENHA_MINIMA) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setErro(null)
    setCarregando(true)
    try {
      await cadastrar(email.trim(), senha)
      router.replace('/boas-vindas')
    } catch (e) {
      console.error('[login] falha ao criar conta:', e)
      setErro(mensagemDeCadastro(codigoDoErro(e)))
    } finally {
      setCarregando(false)
    }
  }

  const campo = [styles.campo, { backgroundColor: cores.superficieAlt }]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]} edges={['top', 'bottom']}>
      <View style={styles.topo}>
        <Text style={[styles.logo, { color: cores.texto }]}>
          NEXO<TextoVerde>.</TextoVerde>
        </Text>
        <Pressable
          style={[styles.tema, { backgroundColor: cores.superficie, borderColor: cores.linha }]}
          onPress={alternarTema}
          accessibilityLabel="Alternar tema"
        >
          {tema === 'claro' ? <Moon color={cores.texto} size={18} /> : <Sun color={cores.texto} size={18} />}
        </Pressable>
      </View>

      <View style={[styles.cartao, { backgroundColor: cores.superficie }]}>
        <Text style={[styles.titulo, { color: cores.texto }]}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>
        <Text style={[styles.subtitulo, { color: cores.textoSuave }]}>
          {modo === 'entrar' ? 'Entre com seu e-mail. Cliente e operador usam a mesma conta.' : 'A senha precisa ter pelo menos 6 caracteres.'}
        </Text>

        <View style={campo}>
          <Mail color={cores.textoSuave} size={18} />
          <TextInput
            style={[styles.input, { color: cores.texto }]}
            placeholder="E-mail"
            placeholderTextColor={cores.textoSuave}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={campo}>
          <Lock color={cores.textoSuave} size={18} />
          <TextInput
            style={[styles.input, { color: cores.texto }]}
            placeholder="Senha"
            placeholderTextColor={cores.textoSuave}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        {modo === 'criar' ? (
          <View style={campo}>
            <Lock color={cores.textoSuave} size={18} />
            <TextInput
              style={[styles.input, { color: cores.texto }]}
              placeholder="Confirmar senha"
              placeholderTextColor={cores.textoSuave}
              value={confirmar}
              onChangeText={setConfirmar}
              secureTextEntry
            />
          </View>
        ) : null}

        {senhaCurta ? <Text style={[styles.erro, { color: cores.perigo }]}>A senha precisa ter pelo menos 6 caracteres.</Text> : null}
        {senhasDiferentes ? <Text style={[styles.erro, { color: cores.perigo }]}>As senhas não coincidem.</Text> : null}
        {erro ? <Text style={[styles.erro, { color: cores.perigo }]}>{erro}</Text> : null}

        <Pressable
          style={[styles.botao, { backgroundColor: cores.destaque, opacity: desabilitado ? 0.45 : 1 }]}
          onPress={modo === 'entrar' ? handleEntrar : handleCriar}
          disabled={desabilitado}
        >
          {carregando ? (
            <ActivityIndicator color={cores.destaqueTexto} />
          ) : (
            <Text style={[styles.botaoTexto, { color: cores.destaqueTexto }]}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={alternarModo} disabled={carregando} style={styles.rodape}>
        <Text style={[styles.rodapeTexto, { color: cores.textoSuave }]}>
          {modo === 'entrar' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
          <TextoVerde style={{ fontWeight: '800' }}>{modo === 'entrar' ? 'Criar conta' : 'Entrar'}</TextoVerde>
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 22,
  },
  topo: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
  },
  tema: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartao: {
    borderRadius: 28,
    padding: 22,
    gap: 12,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  erro: {
    textAlign: 'center',
    fontSize: 13,
  },
  botao: {
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  botaoTexto: {
    fontSize: 16,
    fontWeight: '800',
  },
  rodape: {
    alignItems: 'center',
  },
  rodapeTexto: {
    fontSize: 14,
  },
})
