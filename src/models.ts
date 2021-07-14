import { HubConnection } from '@microsoft/signalr';
import { LiteralUnion } from './ts-helpers';
import { SignalRCommands, SignalREvents } from './index';

export type SignalRCommandKey = LiteralUnion<keyof SignalRCommands>;
export type SignalRCommandPayload<K extends SignalRCommandKey> =
  K extends keyof SignalRCommands
    ? SignalRCommands[K] extends false
      ? undefined
      : SignalRCommands[K]
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any;

export type SignalREventKey = LiteralUnion<keyof SignalREvents>;
export type SignalREventPayload<K extends SignalREventKey> =
  K extends keyof SignalREvents
    ? SignalREvents[K] extends false
      ? undefined
      : SignalREvents[K]
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any;

export type SignalRMethodKey = LiteralUnion<
  keyof SignalRCommands | keyof SignalREvents
>;

export interface VueSignalRConfig {
  connection: HubConnection;
  autoOffInsideComponentScope: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  failFn: (error: any) => void;
}

export interface SignalROnOptions<T> {
  skip?: (arg: T) => boolean;
}
