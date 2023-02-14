import { ConnectionId } from 'rete'

import { Pin } from './types'

export type PinStorageRecord = Pin & { connectionId: ConnectionId }

export function getPinsStorage() {
  const connectionPins = new Map<ConnectionId, PinStorageRecord[]>()
  const pins = new Map<string, PinStorageRecord>()

  return {
    add(connectionId: ConnectionId, pin: Pin, index?: number) {
      if (pins.has(pin.id)) throw new Error('already exists')
      const data = { ...pin, connectionId }
      const list = [...connectionPins.get(connectionId) || []]
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const _index = typeof index === 'number' ? index : list.length

      list.splice(_index, 0, data)
      connectionPins.set(connectionId, list)
      pins.set(pin.id, data)
    },
    remove(id: string) {
      const existing = this.getPin(id)

      if (existing) {
        const list = connectionPins.get(existing.connectionId) || []

        connectionPins.set(existing.connectionId, list.filter(item => item.id !== existing.id))
        pins.delete(existing.id)
      }
    },
    getPin(id: string): PinStorageRecord | undefined {
      return pins.get(id)
    },
    getPins(connectionId?: ConnectionId): PinStorageRecord[] {
      if (connectionId) return connectionPins.get(connectionId) || []
      return Array.from(pins.values())
    }
  }
}
