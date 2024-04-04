import { BaseSchemes, ConnectionId, Scope } from 'rete';
import { BaseArea, RenderSignal } from 'rete-area-plugin';
import { PinStorageRecord } from './storage';
import { PinData, Position } from './types';
export * as RerouteExtensions from './extensions';
/**
 * Signal types consumed by the plugin
 */
export declare type RerouteExtra = RenderSignal<'reroute-pins', {
    data: PinData;
}> | {
    type: 'unmount';
    data: {
        element: HTMLElement;
    };
};
declare type Requires<Schemes extends BaseSchemes> = {
    type: 'connectionpath';
    data: {
        payload: Schemes['Connection'];
        path?: string;
        points: Position[];
    };
};
/**
 * Signal types produced by the plugin
 * @priority 10
 */
export declare type RerouteProduces = {
    type: 'pintranslated';
    data: {
        id: string;
        dx: number;
        dy: number;
    };
} | {
    type: 'pinselected';
    data: {
        id: string;
    };
} | {
    type: 'pinunselected';
    data: {
        id: string;
    };
};
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
export declare class ReroutePlugin<Schemes extends BaseSchemes> extends Scope<RerouteProduces, [Requires<Schemes>, BaseArea<Schemes> | RerouteExtra]> {
    pinContainers: Map<string, {
        element: HTMLElement;
    }>;
    pinParents: Map<HTMLElement, {
        id: ConnectionId;
        pinContainer: HTMLElement;
    }>;
    pins: {
        add(connectionId: string, pin: import("./types").Pin, index?: number | undefined): void;
        remove(id: string): void;
        getPin(id: string): PinStorageRecord | undefined;
        getPins(connectionId?: string | undefined): PinStorageRecord[];
    };
    constructor();
    setParent(scope: Scope<Requires<Schemes>, [BaseArea<Schemes> | RerouteExtra]>): void;
    /**
     * Add a new pin to the connection
     * @param connectionId Connection id
     * @param position Pin position
     * @param index Pin index, if not specified, the pin will be added to the end
     */
    add(connectionId: ConnectionId, position: Position, index?: number): void;
    /**
     * Translate pin
     * @param pinId Pin id
     * @param dx Delta x
     * @param dy Delta y
     */
    translate(pinId: string, dx: number, dy: number): Promise<void>;
    /**
     * Remove pin
     * @param pinId Pin id
     */
    remove(pinId: string): Promise<void>;
    /**
     * Select pin
     * @param pinId Pin id
     */
    select(pinId: string): Promise<void>;
    /**
     * Unselect pin
     * @param pinId Pin id
     */
    unselect(pinId: string): Promise<void>;
    /**
     * Update connection for the pin
     * @param pin Pin id or pin record
     */
    update(pin: string | PinStorageRecord): void;
}
//# sourceMappingURL=index.d.ts.map