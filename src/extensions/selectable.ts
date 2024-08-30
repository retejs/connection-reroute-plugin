import { BaseSchemes } from 'rete'
import { AreaExtensions } from 'rete-area-plugin'

type Selector = ReturnType<typeof AreaExtensions.selector>

import { ReroutePlugin } from '..'

/**
 * Enables synchronization between pins and the selector
 * @param reroutePlugin Reroute plugin instance
 * @param selector Selector instance
 * @param accumulating Accumulating state
 * @listens pinselected
 * @listens pinunselected
 * @listens pintranslated
 */
export function selectablePins<S extends BaseSchemes>(reroutePlugin: ReroutePlugin<S>, selector: Selector, accumulating: { active(): boolean }) {
  reroutePlugin.addPipe(context => {
    if (!('type' in context)) return context

    if (context.type === 'pinselected') {
      const { id } = context.data

      selector.add({
        id,
        label: 'pin',
        translate(dx, dy) {
          void reroutePlugin.translate(id, dx, dy)
        },
        unselect() {
          void reroutePlugin.unselect(id)
        }
      }, accumulating.active())
      selector.pick({ id, label: 'pin' })
    }
    if (context.type === 'pinunselected') {
      const { id } = context.data

      selector.remove({ id, label: 'pin' })
    }
    if (context.type === 'pintranslated') {
      const { id, dx, dy } = context.data

      if (selector.isPicked({ id, label: 'pin' })) selector.translate(dx, dy)
    }
    return context
  })
}
