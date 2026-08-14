import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

interface PeriodoDashboardContextType {
  mesSelecionado: number
  setMesSelecionado: (mes: number) => void
  anoSelecionado: number
  setAnoSelecionado: (ano: number) => void
}

const PeriodoDashboardContext =
  createContext<PeriodoDashboardContextType | null>(
    null,
  )

export function PeriodoDashboardProvider({
  children,
}: {
  children: ReactNode
}) {
  const agora = new Date()

  const [mesSelecionado, setMesSelecionado] =
    useState(agora.getMonth())

  const [anoSelecionado, setAnoSelecionado] =
    useState(agora.getFullYear())

  return (
    <PeriodoDashboardContext.Provider
      value={{
        mesSelecionado,
        setMesSelecionado,
        anoSelecionado,
        setAnoSelecionado,
      }}
    >
      {children}
    </PeriodoDashboardContext.Provider>
  )
}

export function usePeriodoDashboard() {
  const contexto = useContext(
    PeriodoDashboardContext,
  )

  if (!contexto) {
    throw new Error(
      'usePeriodoDashboard deve ser usado dentro de PeriodoDashboardProvider.',
    )
  }

  return contexto
}