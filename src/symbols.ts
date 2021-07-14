import { InjectionKey } from 'vue';
import {
  SignalRCommandKey,
  SignalRCommandPayload,
  SignalREventKey,
  SignalREventPayload,
  SignalROnOptions,
} from './models';
import { createService } from './service';

type CreateServiceReturntype = ReturnType<typeof createService>;

// Relying solely on `ReturnType<typeof createService>` would collapse SignalRXxxKey to `string` type
// into built types, since it would infer the `keyof Xxx` part as empty,
// due to the holder interfaces being empty at build time
export interface SignalRService {
  init: CreateServiceReturntype['init'];
  connected: CreateServiceReturntype['connected'];
  invoke: <Key extends SignalRCommandKey, Payload = SignalRCommandPayload<Key>>(
    methodName: Key,
    payload: Payload
  ) => Promise<unknown>;
  on: <Key extends SignalREventKey, Payload = SignalREventPayload<Key>>(
    methodName: Key,
    callback: (arg: Payload) => void,
    options?: SignalROnOptions<Payload>
  ) => void;
  off: <Key extends SignalREventKey, Payload = SignalREventPayload<Key>>(
    methodName: Key,
    callback?: (arg: Payload) => void
  ) => void;
}

export const SignalRSymbol: InjectionKey<SignalRService> =
  Symbol('SignalRService');
