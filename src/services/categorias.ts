import { supabase } from '../lib/supabase'

export type NovaCategoria = {
  nome: string
  descricao: string
  tipo: string
}

async function buscarEmpresaDoUsuario() {
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

  return usuario.empresa_id
}

export async function listarCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome')

  if (error) {
    throw error
  }

  return data
}

export async function criarCategoria(categoria: NovaCategoria) {
  const empresaId = await buscarEmpresaDoUsuario()

  const { data, error } = await supabase
    .from('categorias')
    .insert({
      empresa_id: empresaId,
      nome: categoria.nome,
      descricao: categoria.descricao || null,
      tipo: categoria.tipo,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function atualizarCategoria(
  categoriaId: string,
  categoria: NovaCategoria,
) {
  const { data, error } = await supabase
    .from('categorias')
    .update({
      nome: categoria.nome,
      descricao: categoria.descricao || null,
      tipo: categoria.tipo,
    })
    .eq('id', categoriaId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function excluirCategoria(categoriaId: string) {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', categoriaId)

  if (error) {
    throw error
  }
}

export async function obterOuCriarCategoriaPadrao() {
  const empresaId = await buscarEmpresaDoUsuario()

  const { data: categoriaExistente, error: erroBusca } = await supabase
    .from('categorias')
    .select('id')
    .eq('empresa_id', empresaId)
    .ilike('nome', 'Produtos importados')
    .maybeSingle()

  if (erroBusca) throw erroBusca

  if (categoriaExistente) {
    return categoriaExistente.id
  }

  const { data: novaCategoria, error: erroCriacao } = await supabase
    .from('categorias')
    .insert({
      empresa_id: empresaId,
      nome: 'Produtos importados',
      descricao: 'Criada automaticamente pela leitura da nota fiscal',
      tipo: 'produto',
    })
    .select('id')
    .single()

  if (erroCriacao) throw erroCriacao

  return novaCategoria.id
}