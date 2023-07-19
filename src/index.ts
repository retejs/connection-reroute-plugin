import { BaseSchemes, ConnectionId, getUID, Scope } from 'rete'
import { BaseArea, BaseAreaPlugin, RenderSignal } from 'rete-area-plugin'
import { classicConnectionPath } from 'rete-render-utils'

import { getPinsStorage, PinStorageRecord } from './storage'
import { PinData, Position } from './types'
import { findRightIndex } from './utils'

export * as RerouteExtensions from './extensions'

/**
 * Signal types consumed by the plugin
 */
export type RerouteExtra =
  | RenderSignal<'reroute-pins', { data: PinData }>
  | { type: 'unmount', data: { element: HTMLElement } }

type Requires<Schemes extends BaseSchemes> =
  | { type: 'connectionpath', data: { payload: Schemes['Connection'], path?: string, points: Position[] } }

/**
 * Signal types produced by the plugin
 * @priority 10
 */
export type RerouteProduces =
  | { type: 'pintranslated', data: { id: string, dx: number, dy: number } }
  | { type: 'pinselected', data: { id: string } }
  | { type: 'pinunselected', data: { id: string } }

/**
 * Reroute plugin
 * @listens rendered
 * @listens unmount
 * @listens reordered
 * @listens connectionpath
 * @listens pointerdown
 * @emits pintranslated
 * @emits pinselected
 * @emits pinunselected
 * @priority 9
 */
export class ReroutePlugin<Schemes extends BaseSchemes> extends Scope<RerouteProduces, [Requires<Schemes>, BaseArea<Schemes> | RerouteExtra]> {
  pinContainers = new Map<ConnectionId, { element: HTMLElement }>()
  pinParents = new Map<HTMLElement, { id: ConnectionId, pinContainer: HTMLElement }>()
  pins = getPinsStorage()

  constructor() {
    super('connection-reroute')
  }

  setParent(scope: Scope<Requires<Schemes>, [BaseArea<Schemes> | RerouteExtra]>): void {
    super.setParent(scope)
    type Base = BaseAreaPlugin<Schemes, BaseArea<Schemes> | RerouteExtra>

    // eslint-disable-next-line max-statements, complexity
    scope.addPipe(context => {
      if (!context || typeof context !== 'object' || !('type' in context)) return context

      if (context.type === 'rendered' && context.data.type === 'connection') {
        const area = scope.parentScope<Base>(BaseAreaPlugin)
        const { element, payload: { id } } = context.data

        if (!this.pinParents.has(element)) {
          const pinContainer = document.createElement('div')

          pinContainer.dataset['type'] = 'pin-container'
          this.pinContainers.set(id, { element: pinContainer })
          this.pinParents.set(element, { id, pinContainer })
          area.area.content.add(pinContainer)
          area.area.content.reorder(pinContainer, element.nextElementSibling)
        }
      }
      if (context.type === 'unmount') {
        const area = scope.parentScope<Base>(BaseAreaPlugin)
        const { element } = context.data
        const record = this.pinParents.get(element)

        if (record) {
          this.pinParents.delete(element)
          this.pinContainers.delete(record.id)
          area.emit({ type: 'unmount', data: { element: record.pinContainer } })
          area.area.content.remove(record.pinContainer)
        }
      }
      if (context.type === 'reordered') {
        const area = scope.parentScope<Base>(BaseAreaPlugin)
        const { element } = context.data
        const record = this.pinParents.get(element)

        if (record) {
          area.area.content.reorder(record.pinContainer, element.nextElementSibling)
        }
      }
      if (context.type === 'connectionpath') {
        const area = scope.parentScope<Base>(BaseAreaPlugin)
        const { payload: { id } } = context.data
        const container = this.pinContainers.get(id)
        const start = context.data.points[0]
        const end = context.data.points[context.data.points.length - 1]

        const pins = this.pins.getPins(id)

        if (container) {
          area.emit({
            type: 'render', data: {
              type: 'reroute-pins',
              element: container.element,
              data: { id, pins }
            }
          })
        }

        const points = [start, ...pins.map(item => item.position), end]
        let path = ''

        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1]
          const b = points[i]

          path += classicConnectionPath([a, b], 0.3) + ' '
        }

        return {
          ...context,
          data: {
            ...context.data,
            points,
            path
          }
        }
      }
      if (context.type === 'pointerdown') {
        const area = scope.parentScope<Base>(BaseAreaPlugin)
        const path = context.data.event.composedPath()
        const views = Array.from(area.connectionViews.entries())
        const pickedConnection = views.find(([, view]) => path.includes(view.element))

        if (pickedConnection) {
          const [id, view] = pickedConnection
          const svgPath = view.element.querySelector('path')
          const pins = this.pins.getPins(id)

          if (svgPath && pins) {
            const position = { ...area.area.pointer }
            const start = svgPath.getPointAtLength(0)
            const end = svgPath.getPointAtLength(1)

            const points: Position[] = [start, ...pins.map(p => p.position), end]
            const index = findRightIndex(position, points)

            this.add(id, position, index)
          }
        }
      }
      return context
    })
  }

  /**
   * Add a new pin to the connection
   * @param connectionId Connection id
   * @param position Pin position
   * @param index Pin index, if not specified, the pin will be added to the end
   */
  public add(connectionId: ConnectionId, position: Position, index?: number) {
    type Base = BaseAreaPlugin<Schemes, BaseArea<Schemes> | RerouteExtra>

    const area = this.parentScope().parentScope<Base>(BaseAreaPlugin)
    const pin = { id: getUID(), position }

    this.pins.add(connectionId, pin, index)
    area.update('connection', connectionId)
  }

  /**
   * Translate pin
   * @param pinId Pin id
   * @param dx Delta x
   * @param dy Delta y
   */
  public async translate(pinId: string, dx: number, dy: number) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    pin.position = { x: pin.position.x + dx, y: pin.position.y + dy }
    this.update(pin)
    await this.emit({ type: 'pintranslated', data: { id: pinId, dx, dy } })
  }

  /**
   * Remove pin
   * @param pinId Pin id
   */
  public async remove(pinId: string) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    if (pin.selected) await this.unselect(pinId)
    this.pins.remove(pinId)
    this.update(pin)
  }

  /**
   * Select pin
   * @param pinId Pin id
   */
  public async select(pinId: string) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    if (pin.selected) return
    pin.selected = true
    this.update(pin)
    await this.emit({ type: 'pinselected', data: { id: pinId } })
  }

  /**
   * Unselect pin
   * @param pinId Pin id
   */
  public async unselect(pinId: string) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    if (!pin.selected) return
    pin.selected = false
    this.update(pin)
    await this.emit({ type: 'pinunselected', data: { id: pinId } })
  }

  /**
   * Update connection for the pin
   * @param pin Pin id or pin record
   */
  public update(pin: string | PinStorageRecord) {
    type Base = BaseAreaPlugin<Schemes, BaseArea<Schemes> | RerouteExtra>

    const pinRecord = typeof pin === 'object' ? pin : this.pins.getPin(pin)
    const area = this.parentScope().parentScope<Base>(BaseAreaPlugin)

    if (!pinRecord) return
    area.update('connection', pinRecord.connectionId)
  }
}
