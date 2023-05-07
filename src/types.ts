import { ConnectionId } from 'rete'

export type Position = { x: number, y: number }

export type Pin = {
  id: string
  position: Position
  selected?: boolean
}
export type PinData = {
  id: ConnectionId
  pins: Pin[]
}
