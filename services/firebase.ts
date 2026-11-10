import AsyncStorage from '@react-native-async-storage/async-storage'
import { getApp, getApps, initializeApp } from 'firebase/app'
// getReactNativePersistence existe no build React Native do Firebase Auth (SDK 12),
// mas os tipos publicados em `firebase/auth` cobrem só o build web — daí o @ts-ignore.
// @ts-ignore
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import type { Produto } from '../types'
import { gravarCatalogoLocal, lerCatalogoLocal, mesclarCatalogo, type AjusteProduto } from './catalogoLocal'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// initializeAuth só pode ser chamado uma vez por app; no Fast Refresh a segunda
// chamada lança erro, então caímos para getAuth() nesse caso.
let auth: Auth
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
} catch {
  auth = getAuth(app)
}

export { auth }

export const db: Firestore = getFirestore(app)

const paraProduto = (id: string, dados: DocumentData): Produto => ({
  id,
  nome: dados.nome,
  preco_brl: dados.preco_brl,
  codigo_barras: dados.codigo_barras,
  categoria: dados.categoria,
  foto: typeof dados.foto === 'string' && dados.foto.length > 0 ? dados.foto : undefined,
})

const paraAjuste = (entrada: Omit<Produto, 'id'>): AjusteProduto => ({
  nome: entrada.nome.trim(),
  preco_brl: entrada.preco_brl,
  codigo_barras: entrada.codigo_barras.trim(),
  categoria: entrada.categoria.trim(),
  foto: entrada.foto?.trim() || undefined,
})

const paraRemoto = (ajuste: AjusteProduto): Record<string, string | number> => {
  const remoto: Record<string, string | number> = {
    nome: ajuste.nome,
    preco_brl: ajuste.preco_brl,
    codigo_barras: ajuste.codigo_barras,
    categoria: ajuste.categoria,
  }
  if (ajuste.foto && !ajuste.foto.startsWith('data:') && ajuste.foto.length < 500) {
    remoto.foto = ajuste.foto
  }
  return remoto
}

export const listarProdutos = async (): Promise<Produto[]> => {
  const snapshot = await getDocs(collection(db, 'produtos'))
  const remotos = snapshot.docs.map((item) => paraProduto(item.id, item.data()))
  const estado = await lerCatalogoLocal()
  return mesclarCatalogo(remotos, estado)
}

export const buscarProdutoPorCodigo = async (codigo: string): Promise<Produto | null> => {
  const produtos = await listarProdutos()
  return produtos.find((item) => item.codigo_barras === codigo) ?? null
}

export const buscarProdutoPorId = async (id: string): Promise<Produto | null> => {
  const estado = await lerCatalogoLocal()
  if (estado.ocultos.includes(id)) return null
  const criado = estado.criados.find((item) => item.id === id)
  if (criado) return criado
  const snap = await getDoc(doc(db, 'produtos', id))
  if (!snap.exists()) return null
  const produto = paraProduto(snap.id, snap.data())
  const ajuste = estado.ajustes[id]
  return ajuste ? { ...produto, ...ajuste, id } : produto
}

export const salvarProduto = async (entrada: Omit<Produto, 'id'> & { id?: string }): Promise<Produto> => {
  const ajuste = paraAjuste(entrada)
  const estado = await lerCatalogoLocal()
  const remoto = paraRemoto(ajuste)

  if (!entrada.id || entrada.id.startsWith('local-')) {
    try {
      const ref = await addDoc(collection(db, 'produtos'), remoto)
      if (entrada.id) {
        estado.criados = estado.criados.filter((item) => item.id !== entrada.id)
        await gravarCatalogoLocal(estado)
      }
      return { id: ref.id, ...ajuste }
    } catch (e) {
      console.error('[catalogo] falha ao criar no Firestore, guardando neste aparelho:', e)
      const id = entrada.id ?? `local-${Date.now()}`
      const produto: Produto = { id, ...ajuste }
      const indice = estado.criados.findIndex((item) => item.id === id)
      if (indice >= 0) estado.criados[indice] = produto
      else estado.criados.unshift(produto)
      await gravarCatalogoLocal(estado)
      return produto
    }
  }

  try {
    await updateDoc(doc(db, 'produtos', entrada.id), remoto)
  } catch (e) {
    console.error('[catalogo] falha ao editar no Firestore, guardando neste aparelho:', e)
  }
  estado.ajustes[entrada.id] = ajuste
  await gravarCatalogoLocal(estado)
  return { id: entrada.id, ...ajuste }
}

export const excluirProduto = async (id: string): Promise<void> => {
  const estado = await lerCatalogoLocal()
  estado.criados = estado.criados.filter((item) => item.id !== id)
  if (id.startsWith('local-')) {
    await gravarCatalogoLocal(estado)
    return
  }
  try {
    await deleteDoc(doc(db, 'produtos', id))
  } catch (e) {
    console.error('[catalogo] falha ao excluir no Firestore, ocultando neste aparelho:', e)
  }
  if (!estado.ocultos.includes(id)) estado.ocultos.push(id)
  delete estado.ajustes[id]
  await gravarCatalogoLocal(estado)
}
