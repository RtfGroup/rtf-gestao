import { supabase } from "../../lib/supabase";

export interface Cliente {
  id: string;
  nome: string;
}

export interface ProdutoVenda {
  id: string;
  nome: string;
  preco_venda: number;
}

export interface FormaPagamento {
  id: string;
  nome: string;
}

export interface ItemVenda {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  desconto?: number;
  observacoes?: string;
}

export interface NovaVendaPayload {
  empresa_id: string;
  cliente_id?: string | null;
  usuario_id: string;
  forma_pagamento_id: string;
  data_venda?: string;

  tipo_venda: string;
  codigo?: string;

  desconto?: number;
  acrescimo?: number;

  observacoes?: string;
  observacoes_pagamento?: string;

  numero_parcelas?: number;

  itens: ItemVenda[];
}

class VendasService {
  async listarClientes(empresaId: string) {
    const { data, error } = await supabase
      .from("clientes")
      .select("id,nome")
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .order("nome");

    if (error) throw error;

    return (data ?? []) as Cliente[];
  }

  async listarProdutos(empresaId: string) {
    const { data, error } = await supabase
      .from("produtos")
      .select("id,nome,preco_venda")
      .eq("empresa_id", empresaId)
      .eq("ativo", true)
      .order("nome");

    if (error) throw error;

    return (data ?? []) as ProdutoVenda[];
  }

  async listarFormasPagamento(empresaId: string) {
    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("id,nome")
.select("*")
      .order("nome");

    console.log("Empresa:", empresaId);
    console.log("Formas:", data);
    console.log("Erro:", error);

    if (error) throw error;

    return (data ?? []) as FormaPagamento[];
  }

  async listarVendas(empresaId: string) {
    const { data, error } = await supabase
      .from("vendas")
      .select(
        `
        *,
        clientes(nome)
      `
      )
      .eq("empresa_id", empresaId)
      .order("data_venda", { ascending: false });

    if (error) throw error;

    return data ?? [];
  }

  async registrarVenda(payload: NovaVendaPayload) {
    const { data, error } = await supabase.rpc("registrar_venda", {
      p_venda: payload,
    });

    if (error) throw error;

    return data;
  }
}

export default new VendasService();