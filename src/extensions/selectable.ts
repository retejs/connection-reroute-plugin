import { BaseSchemes } from 'rete'
import { AreaExtensions } from 'rete-area-plugin'

type Selector = ReturnType<typeof AreaExtensions.selector>

import { ReroutePlugin } from '..'

export function selectablePins<S extends BaseSchemes, K>(reroutePlugin: ReroutePlugin<S, K>, selector: Selector, accumulating: { active(): boolean }) {
  // eslint-disable-next-line max-statements
  reroutePlugin.addPipe(context => {
    if (!('type' in context)) return context

    if (context.type === 'pinselected') {
      const { id } = context.data

      if (!accumulating.active()) selector.unselectAll()
      selector.add({
        id,
        label: 'pin',
        translate(dx, dy) {
          reroutePlugin.translate(id, dx, dy)
        },
        unselect() {
          reroutePlugin.unselect(id)
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
