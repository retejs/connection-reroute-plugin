import { ConnectionId } from 'rete';
import { Pin } from './types';
export declare type PinStorageRecord = Pin & {
    connectionId: ConnectionId;
};
export declare function getPinsStorage(): {
    add(connectionId: ConnectionId, pin: Pin, index?: number): void;
    remove(id: string): void;
    getPin(id: string): PinStorageRecord | undefined;
    getPins(connectionId?: ConnectionId): PinStorageRecord[];
};
//# sourceMappingURL=storage.d.ts.map