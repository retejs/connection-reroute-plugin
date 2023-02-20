import { BaseSchemes, CanAssignSignal, ConnectionId, getUID, Scope } from 'rete'
import { Area2DInherited, AreaPlugin, RenderData } from 'rete-area-plugin'
import { classicConnectionPath } from 'rete-render-utils'

import { getPinsStorage, PinStorageRecord } from './storage'
import { PinsRenderData, Position } from './types'
import { findRightIndex } from './utils'

export * as RerouteExtensions from './extensions'

export type RerouteExtra<Schemes extends BaseSchemes> =
    | { type: 'render', data: RenderData<Schemes> | PinsRenderData }
    | { type: 'rendered', data: RenderData<Schemes> | PinsRenderData }

type RenderProduces<Schemes extends BaseSchemes> =
    | { type: 'connectionpath', data: { payload: Schemes['Connection'], path?: string, points: Position[] } }

type IsCompatible<K> = Extract<K, { type: 'render' }> extends { type: 'render', data: infer P } ? CanAssignSignal<P, PinsRenderData> : false // TODO should add type: 'render' ??
type Substitute<K> = IsCompatible<K> extends true ? K : RerouteExtra<BaseSchemes>

export type RerouteProduces =
    | { type: 'pintranslated', data: { id: string, dx: number, dy: number }}
    | { type: 'pinselected', data: { id: string }}
    | { type: 'pinunselected', data: { id: string }}

export class ReroutePlugin<Schemes extends BaseSchemes, K = never> extends Scope<RerouteProduces, [RenderProduces<Schemes>, ...Area2DInherited<Schemes, Substitute<K>>]> {
  pinContainers = new Map<ConnectionId, { element: HTMLElement }>()
  pins = getPinsStorage()

  constructor() {
    super('connection-reroute')
  }

  setParent(scope: Scope<RenderProduces<Schemes>, Area2DInherited<Schemes, Substitute<K>>>): void {
    super.setParent(scope)

    // eslint-disable-next-line max-statements, complexity
    scope.addPipe(context => {
      if (!context || typeof context !== 'object' || !('type' in context)) return context

      if (context.type === 'rendered' && context.data.type === 'connection') {
        const { element, payload: { id } } = context.data

        if (!this.pinContainers.has(id)) {
          const pinContainer = document.createElement('div')

          this.pinContainers.set(id, { element: pinContainer })

          element.appendChild(pinContainer)
        }
      }
      if (context.type === 'connectionpath') {
        const area = scope.parentScope<AreaPlugin<Schemes, RerouteExtra<Schemes>>>(AreaPlugin)
        const { payload: { id } } = context.data
        const container = this.pinContainers.get(id)
        const start = context.data.points[0]
        const end = context.data.points[context.data.points.length - 1]

        const pins = this.pins.getPins(id)

        if (container) {
          area.emit({ type: 'render', data: {
            type: 'reroute-pins',
            element: container.element,
            data: { id, pins }
          } })
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
        const area = scope.parentScope<AreaPlugin<Schemes, RerouteExtra<Schemes>>>(AreaPlugin)
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

  public add(connectionId: ConnectionId, position: Position, index?: number) {
    const area = this.parentScope().parentScope<AreaPlugin<Schemes, RerouteExtra<Schemes>>>(AreaPlugin)
    const pin = { id: getUID(), position }

    this.pins.add(connectionId, pin, index)
    area.update('connection', connectionId)
  }

  public async translate(pinId: string, dx: number, dy: number) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    pin.position = { x: pin.position.x + dx, y: pin.position.y + dy }
    this.update(pin)
    await this.emit({ type: 'pintranslated', data: { id: pinId, dx, dy } })
  }

  public async remove(pinId: string) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    if (pin.selected) await this.unselect(pinId)
    this.pins.remove(pinId)
    this.update(pin)
  }

  public async select(pinId: string) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    if (pin.selected) return
    pin.selected = true
    this.update(pin)
    await this.emit({ type: 'pinselected', data: { id: pinId } })
  }

  public async unselect(pinId: string) {
    const pin = this.pins.getPin(pinId)

    if (!pin) return
    if (!pin.selected) return
    pin.selected = false
    this.update(pin)
    await this.emit({ type: 'pinunselected', data: { id: pinId } })
  }

  public update(pin: string | PinStorageRecord) {
    const pinRecord = typeof pin === 'object' ? pin : this.pins.getPin(pin)
    const area = this.parentScope().parentScope<AreaPlugin<Schemes, RerouteExtra<Schemes>>>(AreaPlugin)

    if (!pinRecord) return
    area.update('connection', pinRecord.connectionId)
  }
}
