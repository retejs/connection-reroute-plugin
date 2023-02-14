/* eslint-disable @typescript-eslint/naming-convention */
import { ReteOptions } from 'rete-cli'

export default <ReteOptions>{
  input: 'src/index.ts',
  name: 'ConnectionReroutePlugin',
  globals: {
    'rete': 'Rete',
    'rete-area-plugin': 'AreaPlugin',
    'rete-render-utils': 'RenderUtils'
  }
}
