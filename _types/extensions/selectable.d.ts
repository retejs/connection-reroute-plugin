import { BaseSchemes } from 'rete';
import { AreaExtensions } from 'rete-area-plugin';
declare type Selector = ReturnType<typeof AreaExtensions.selector>;
import { ReroutePlugin } from '..';
/**
 * Enables synchronization between pins and the selector
 * @param reroutePlugin Reroute plugin instance
 * @param selector Selector instance
 * @param accumulating Accumulating state
 * @listens pinselected
 * @listens pinunselected
 * @listens pintranslated
 */
export declare function selectablePins<S extends BaseSchemes>(reroutePlugin: ReroutePlugin<S>, selector: Selector, accumulating: {
    active(): boolean;
}): void;
export {};
//# sourceMappingURL=selectable.d.ts.map