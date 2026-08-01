import { supabase } from "../../lib/supabase";

export interface ContaReceber {
  id: string;
  empresa_id: string;

  cliente_id: string | null;
  cliente_nome: string | null;
  cliente_telefone: string | null;

  venda_id: string | null;
  venda_codigo: string | null;
  data_venda: string | null;

  descricao: string;

  valor_original: number;
  valor_recebido: number;
  saldo_pendente: number;

  data_vencimento: string | null;
  data_recebimento: string | null;

  status: string;
  forma_pagamento: string | null;

  observacoes: string | null;

  dias_atraso: number;
  vencida: boolean;

  criado_em: string;
  atualizado_em: string;
}

export interface ReceberContaDTO {
  contaId: string;
  valor: number;
  data?: string;
  observacoes?: string;
}

export async function listarContasReceber() {
  const { data, error } = await supabase
    .from("vw_contas_receber")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) throw error;

  return data as ContaReceber[];
}

export async function receberConta(dto: ReceberContaDTO) {
  const { data, error } = await supabase.rpc("receber_conta", {
    p_conta_receber_id: dto.contaId,
    p_valor_recebido: dto.valor,
    p_data_recebimento: dto.data ?? new Date().toISOString(),
    p_observacoes: dto.observacoes ?? null,
  });

  if (error) throw error;

  return data;
}

export async function obterResumoContasReceber() {
  const contas = await listarContasReceber();

  const totalReceber = contas
    .filter((c) => c.status !== "RECEBIDO")
    .reduce((soma, c) => soma + Number(c.saldo_pendente), 0);

  const recebido = contas.reduce(
    (soma, c) => soma + Number(c.valor_recebido),
    0
  );

  const atrasadas = contas
    .filter((c) => c.vencida)
    .reduce((soma, c) => soma + Number(c.saldo_pendente), 0);

  return {
    contas,
    totalReceber,
    recebido,
    atrasadas,
    quantidade: contas.length,
  };
}