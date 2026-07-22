# RTF Gestão - Arquitetura Oficial

## Objetivo

O RTF Gestão é um ERP SaaS multiempresa desenvolvido inicialmente para restaurantes, mas preparado para atender qualquer tipo de empresa.

Toda regra de negócio deve ser centralizada e seguir processos bem definidos.

---

# Arquitetura

Frontend
↓
React + TypeScript

↓

Services

↓

Supabase RPC

↓

Funções SQL

↓

Banco de Dados

---

# Princípios

1. Nenhuma tela altera saldo diretamente.

2. Toda movimentação deve gerar histórico.

3. Compra não representa pagamento.

4. Venda não representa recebimento.

5. Fluxo de caixa representa apenas dinheiro que entrou ou saiu.

6. Estoque é consequência das movimentações.

7. Todo registro pertence a uma empresa.

8. Toda operação deve ser auditável.

9. Nenhuma regra de negócio ficará duplicada.

10. Toda funcionalidade nova deve possuir documentação antes do desenvolvimento.

---

# Motores do ERP

Motor de Estoque

registrar_movimentacao_estoque()

Motor Financeiro

registrar_movimentacao_financeira()

Motor Compras

registrar_compra()

Motor Vendas

registrar_venda()

Motor Produção

registrar_producao()

---

# Objetivo Final

Todo módulo do sistema deverá utilizar os motores oficiais do ERP.

Nenhuma tela poderá executar regras diretamente no banco.