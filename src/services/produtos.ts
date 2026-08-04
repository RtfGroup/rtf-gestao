import { supabase } from '../lib/supabase'
import { obterOuCriarCategoriaPadrao } from './categorias'

export type NovoProduto = {
  nome: string
  descricao: string
  categoria_id: string
  codigo: string
  codigo_barras: string
  tipo: string
  unidade_medida: string
  preco_custo: number
  preco_venda: number
  controla_estoque: boolean
  estoque_minimo: number
  estoque_maximo: number | null
  ativo: boolean
}

export async function listarProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      categorias (
        nome
      )
    `)
    .order('nome')

  if (error) {
    throw error
  }

  return (data ?? []).map((produto) => ({
    ...produto,
    categoria: produto.categorias?.nome ?? null,
  }))
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

  const categoriaId =
  produto.categoria_id || (await obterOuCriarCategoriaPadrao())

  const { data, error } = await supabase
    .from('produtos')
.insert({
  empresa_id: usuario.empresa_id,
  nome: produto.nome,
  descricao: produto.descricao || null,
  categoria_id: categoriaId,
  codigo: produto.codigo || null,
  codigo_barras: produto.codigo_barras || null,
  tipo: produto.tipo,
  unidade_medida: produto.unidade_medida,
  preco_custo: produto.preco_custo,
  preco_venda: produto.preco_venda,
  controla_estoque: produto.controla_estoque,
  estoque_minimo: produto.estoque_minimo,
  estoque_maximo: produto.estoque_maximo,
  ativo: produto.ativo,
})
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function atualizarProduto(
  produtoId: string,
  produto: NovoProduto,
) {
  const { data, error } = await supabase
    .from('produtos')
.update({
  nome: produto.nome,
  descricao: produto.descricao || null,
  categoria_id: produto.categoria_id,
  codigo: produto.codigo || null,
  codigo_barras: produto.codigo_barras || null,
  tipo: produto.tipo,
  unidade_medida: produto.unidade_medida,
  preco_custo: produto.preco_custo,
  preco_venda: produto.preco_venda,
  controla_estoque: produto.controla_estoque,
  estoque_minimo: produto.estoque_minimo,
  estoque_maximo: produto.estoque_maximo,
  ativo: produto.ativo,
})
    .eq('id', produtoId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function excluirProduto(produtoId: string) {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', produtoId)

  if (error) {
    throw error
  }
}