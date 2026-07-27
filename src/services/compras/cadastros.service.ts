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
  async listarFornecedores(empresaId: string) {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('id, nome')
      .eq('empresa_id', empresaId)
      .order('nome')

    if (error) {
      throw new Error(error.message)
    }

    return data as FornecedorCompra[]
  }

  async listarProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, preco_custo')
      .order('nome')

    if (error) {
      throw new Error(error.message)
    }

    return data as ProdutoCompra[]
  }
}

export const cadastrosCompraService = new CadastrosCompraService()