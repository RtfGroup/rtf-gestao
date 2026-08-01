export type EventoRTF =
  | 'VENDA_CRIADA'
  | 'VENDA_CANCELADA'
  | 'COMPRA_CRIADA'
  | 'COMPRA_CANCELADA'
  | 'ESTOQUE_ALTERADO'
  | 'CLIENTE_CRIADO'
  | 'PRODUTO_CRIADO'
  | 'CONTA_PAGA'
  | 'CONTA_RECEBIDA'
  | 'WHATSAPP_PEDIDO'
  | 'OCR_NOTA'
  | 'IA_COMANDO'

export interface EventoEngine<T = unknown> {
  empresaId: string
  evento: EventoRTF
  origem: string
  referenciaId?: string
  dados: T
  criadoEm?: Date
}