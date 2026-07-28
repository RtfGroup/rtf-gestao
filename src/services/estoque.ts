import { supabase } from '../lib/supabase'

export interface ItemEstoque {
  id: string
  produto_id: string
  quantidade_atual: number
  custo_medio: number
  estoque_minimo: number
  ultima_movimentacao: string | null

  produtos:
    | {
        nome: string
      }
    | {
        nome: string
      }[]
    | null
}

async function obterEmpresaId() {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser()

  if (erroUsuario || !user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (error) {
    throw error
  }

  if (!usuario?.empresa_id) {
    throw new Error('Usuário sem empresa vinculada.')
  }

  return usuario.empresa_id
}

export async function listarEstoque() {
  const empresaId = await obterEmpresaId()

  const { data, error } = await supabase
    .from('estoque')
    .select(`
      id,
      produto_id,
      quantidade_atual,
      custo_medio,
      estoque_minimo,
      ultima_movimentacao,
      produtos (
        nome
      )
    `)
    .eq('empresa_id', empresaId)
    .order('ultima_movimentacao', {
      ascending: false,
      nullsFirst: false,
    })

  if (error) {
    throw error
  }

  return (data ?? []) as ItemEstoque[]
}