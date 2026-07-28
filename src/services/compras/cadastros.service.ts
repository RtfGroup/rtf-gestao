import { supabase } from '../../lib/supabase'

export interface FornecedorCompra {
  id: string
  nome: string
}

export interface ProdutoCompra {
  id: string
  nome: string
  preco_custo?: number | null
}

class CadastrosCompraService {
  private async obterEmpresaId() {
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
      throw new Error(erroPerfil.message)
    }

    if (!usuario?.empresa_id) {
      throw new Error('Usuário sem empresa vinculada.')
    }

    return usuario.empresa_id
  }

  async listarFornecedores() {
    const empresaId = await this.obterEmpresaId()

    const { data, error } = await supabase
      .from('fornecedores')
      .select('id, nome_fantasia, razao_social')
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .order('nome_fantasia')

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((fornecedor) => ({
      id: fornecedor.id,
      nome:
        fornecedor.nome_fantasia ||
        fornecedor.razao_social ||
        'Fornecedor sem nome',
    })) as FornecedorCompra[]
  }

  async listarProdutos() {
    const empresaId = await this.obterEmpresaId()

    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, preco_custo')
      .eq('empresa_id', empresaId)
      .order('nome')

    if (error) {
      throw new Error(error.message)
    }

    return data as ProdutoCompra[]
  }
}

export const cadastrosCompraService = new CadastrosCompraService()