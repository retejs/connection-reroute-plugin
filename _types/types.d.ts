import { ConnectionId } from 'rete';
export declare type Position = {
    x: number;
    y: number;
};
export declare type Pin = {
    id: string;
    position: Position;
    selected?: boolean;
};
export declare type PinData = {
    id: ConnectionId;
    pins: Pin[];
};
//# sourceMappingURL=types.d.ts.map