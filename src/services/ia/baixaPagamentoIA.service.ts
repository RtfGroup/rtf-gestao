import { supabase } from '../../lib/supabase'

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bfornecedor\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

export async function localizarContaPagar(
  empresaId: string,
  fornecedor: string,
) {
  const { data: contas, error: erroContas } =
    await supabase
      .from('contas_pagar')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('status', 'PENDENTE')

  if (erroContas) {
    throw erroContas
  }

  const idsFornecedores = [
    ...new Set(
      (contas ?? [])
        .map((conta) => conta.fornecedor_id)
        .filter(Boolean),
    ),
  ]

  if (idsFornecedores.length === 0) {
    return null
  }

  const { data: fornecedores, error: erroFornecedores } =
    await supabase
      .from('fornecedores')
      .select('id,nome_fantasia,razao_social')
      .in('id', idsFornecedores)

  if (erroFornecedores) {
    throw erroFornecedores
  }

  const fornecedorProcurado = normalizar(fornecedor)

  const fornecedorEncontrado =
    (fornecedores ?? []).find((item) => {
      const nomeFantasia = normalizar(
        item.nome_fantasia ?? '',
      )

      const razaoSocial = normalizar(
        item.razao_social ?? '',
      )

      return (
        nomeFantasia === fornecedorProcurado ||
        razaoSocial === fornecedorProcurado ||
        nomeFantasia.includes(fornecedorProcurado) ||
        razaoSocial.includes(fornecedorProcurado) ||
        fornecedorProcurado.includes(nomeFantasia) ||
        fornecedorProcurado.includes(razaoSocial)
      )
    })

  if (!fornecedorEncontrado) {
    return null
  }

  return (
    contas?.find(
      (conta) =>
        conta.fornecedor_id === fornecedorEncontrado.id,
    ) ?? null
  )
}

export async function registrarBaixaPagamento(
  contaId: string,
  valor: number,
) {
  const { data, error } = await supabase.rpc(
    'pagar_conta',
    {
      p_conta_pagar_id: contaId,
      p_valor_pago: valor,
    },
  )

  if (error) {
    throw error
  }

  return data
}