import { supabase } from "../../lib/supabase";

export interface ItemCompra {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
}

export interface RegistrarCompraPayload {
  empresa_id: string;
  fornecedor_id: string;
  numero_compra?: string;
  numero_nota?: string;
  data_compra: string;
  gera_contas_pagar: boolean;
  observacoes?: string;
  itens: ItemCompra[];
}

class ComprasService {
  async registrarCompra(dados: RegistrarCompraPayload) {
    const { data, error } = await supabase.rpc("registrar_compra", {
      p_compra: dados,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as string;
  }

  async listarCompras(empresaId: string) {
    const { data, error } = await supabase
      .from("compras")
      .select(`
        id,
        numero_compra,
        numero_nota,
        data_compra,
        valor_total,
        status,
        observacoes,
        fornecedores (
          id,
          nome
        )
      `)
      .eq("empresa_id", empresaId)
      .order("data_compra", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const comprasService = new ComprasService();