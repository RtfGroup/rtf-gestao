import { supabase } from '../lib/supabase'

export type NovoProduto = {
  nome: string
  descricao: string
}

export async function listarProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome')

  if (error) {
    throw error
  }

  return data
}

export async function criarProduto(produto: NovoProduto) {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser()

  if (erroUsuario || !user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data: usuario, error: erroPerfil } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (erroPerfil) {
    throw erroPerfil
  }

  if (!usuario?.empresa_id) {
    throw new Error('Usuário sem empresa vinculada.')
  }

  const { data, error } = await supabase
    .from('produtos')
    .insert({
      empresa_id: usuario.empresa_id,
      nome: produto.nome,
      descricao: produto.descricao || null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}