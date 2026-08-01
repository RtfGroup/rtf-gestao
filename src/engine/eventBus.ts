import type { EventoEngine } from './types'

type Handler = (evento: EventoEngine) => Promise<void> | void

class EventBus {
  private handlers = new Map<string, Handler[]>()

  on(evento: string, handler: Handler) {
    const lista = this.handlers.get(evento) ?? []

    lista.push(handler)

    this.handlers.set(evento, lista)
  }

  async emit(evento: EventoEngine) {
    const lista = this.handlers.get(evento.evento)

    if (!lista) return

    for (const handler of lista) {
      await handler(evento)
    }
  }
}

export const eventBus = new EventBus()