# Módulo de Compras

## Objetivo

Controlar todas as compras realizadas pela empresa.

---

## Fluxo

Fornecedor

↓

Nova Compra

↓

Adicionar Produtos

↓

Salvar Rascunho

↓

Conferir

↓

Confirmar Compra

↓

Registrar Movimentações de Estoque

↓

Atualizar Custo Médio

↓

Gerar Conta a Pagar

↓

Aguardar Pagamento

↓

Registrar Pagamento

↓

Fluxo de Caixa

---

## Status

RASCUNHO

CONFIRMADA

CANCELADA

---

## Regras

Uma compra em rascunho não altera estoque.

Uma compra em rascunho não gera financeiro.

Somente compras confirmadas movimentam estoque.

Pagamento nunca ocorre automaticamente.

Cancelamento deve estornar todas as movimentações.

---

## Funcionalidades Futuras

Importação XML

Leitura automática da NF-e

Sugestão automática de produtos

Sugestão automática de fornecedor

Histórico de preços

Comparação entre fornecedores

Rateio de frete

Rateio de impostos