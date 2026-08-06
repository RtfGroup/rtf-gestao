import { supabase } from '../../lib/supabase'

export async function localizarContaReceber(
  empresaId: string,
  cliente: string,
) {
  const { data, error } = await supabase
    .from('contas_receber')
    .select(`
  *,
  clientes(
    id,
    nome
  )
`)
    .eq('empresa_id', empresaId)
    .eq('status', 'PENDENTE')

  if (error) {
    throw error
  }

  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  return (
  data?.find(
    (conta: any) =>
      normalizar(
  conta.clientes?.nome ?? '',
) === normalizar(cliente)
  ) ?? null
)
}

export async function registrarBaixaRecebimento({
  contaId,
  valor,
  formaPagamento,
}: {
  contaId: string
  valor: number
  formaPagamento: string
}) {
  const { data, error } = await supabase.rpc(
  'receber_conta',
  {
    p_conta_receber_id: contaId,
    p_valor_recebido: valor,
    p_data_recebimento: new Date().toISOString(),
    p_observacoes:
      `Recebimento registrado pela RTF AI - ${formaPagamento}`,
  },
)

  if (error) {
    throw error
  }

  return data
}