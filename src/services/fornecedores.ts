import { supabase } from '../lib/supabase'

export interface Fornecedor {
  id: string
  empresa_id: string
  razao_social: string | null
  nome_fantasia: string | null
  cpf_cnpj: string | null
  telefone: string | null
  email: string | null
  ativo: boolean
}

export interface NovoFornecedor {
  razao_social: string
  nome_fantasia: string
  cpf_cnpj?: string
  telefone?: string
  email?: string
}

async function buscarEmpresaUsuario() {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser()

  if (erroUsuario || !user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (error) {
    throw error
  }

  if (!data?.empresa_id) {
    throw new Error('Usuário sem empresa vinculada.')
  }

  return data.empresa_id
}

export async function listarFornecedores() {
  const empresaId = await buscarEmpresaUsuario()

  const { data, error } = await supabase
    .from('fornecedores')
    .select(`
      id,
      empresa_id,
      razao_social,
      nome_fantasia,
      cpf_cnpj,
      telefone,
      email,
      ativo
    `)
    .eq('empresa_id', empresaId)
    .order('nome_fantasia')

  if (error) {
    throw error
  }

  return (data ?? []) as Fornecedor[]
}

export async function criarFornecedor(
  fornecedor: NovoFornecedor,
) {
  const empresaId = await buscarEmpresaUsuario()

  const { data, error } = await supabase
    .from('fornecedores')
    .insert({
      empresa_id: empresaId,
      razao_social: fornecedor.razao_social,
      nome_fantasia: fornecedor.nome_fantasia,
      cpf_cnpj: fornecedor.cpf_cnpj || null,
      telefone: fornecedor.telefone || null,
      email: fornecedor.email || null,
      ativo: true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}