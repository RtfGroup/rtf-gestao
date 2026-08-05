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
async atualizarVenda(
  vendaId: string,
  payload: NovaVendaPayload,
) {
  const valorTotal = Math.max(
    payload.itens.reduce(
      (total, item) =>
        total +
        item.quantidade * item.valor_unitario -
        (item.desconto ?? 0),
      0,
    ) -
      (payload.desconto ?? 0) +
      (payload.acrescimo ?? 0),
    0,
  )

  const { error: erroExcluirItens } = await supabase
    .from('itens_venda')
    .delete()
    .eq('venda_id', vendaId)

  if (erroExcluirItens) {
    throw erroExcluirItens
  }

  const { error: erroInserirItens } = await supabase
    .from('itens_venda')
    .insert(
      payload.itens.map((item) => ({
        venda_id: vendaId,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        desconto: item.desconto ?? 0,
      })),
    )

  if (erroInserirItens) {
    throw erroInserirItens
  }

  const { error: erroVenda } = await supabase
    .from('vendas')
    .update({
      cliente_id: payload.cliente_id ?? null,
      usuario_id: payload.usuario_id,
      data_venda: payload.data_venda,
      tipo_venda: payload.tipo_venda,
      desconto: payload.desconto ?? 0,
      acrescimo: payload.acrescimo ?? 0,
      observacoes: payload.observacoes ?? null,
      valor_total: valorTotal,
    })
    .eq('id', vendaId)

  if (erroVenda) {
    throw erroVenda
  }
}

}

export default new VendasService()