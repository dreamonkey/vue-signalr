import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';
import { resolveMethodName } from './mapping';
import {
  SignalRCommandKey,
  SignalRCommandPayload,
  SignalREventKey,
  SignalREventPayload,
  SignalROnOptions,
  VueSignalRConfig,
} from './models';

export function createService({
  connection,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  failFn = () => {},
  autoOffInsideComponentScope = true,
}: VueSignalRConfig) {
  const connected = ref(false);
  const invokeQueue: (() => void)[] = [];
  const activeListenersSet = new Set();

  connection.onclose(failFn);

  async function init() {
    try {
      await connection.start();
      connected.value = true;
      while (invokeQueue.length) {
        const action = invokeQueue.shift();
        action?.();
      }
    } catch (error) {
      failFn(error);
    }
  }

  function invoke<Key extends SignalRCommandKey>(
    methodName: Key,
    ...payload: SignalRCommandPayload<Key>
  ) {
    return new Promise((resolve, reject) => {
      const invokeFn = () =>
        connection
          .invoke(resolveMethodName(methodName), ...payload)
          .then(resolve)
          .catch(reject);

      if (connected.value) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        invokeFn();
      } else {
        invokeQueue.push(invokeFn);
      }
    });
  }

  function on<
    Key extends SignalREventKey,
    Payload extends unknown[] = SignalREventPayload<Key>
  >(
    methodName: Key,
    callback: (...payload: Payload) => void,
    { skip }: SignalROnOptions<Payload> = {}
  ) {
    const originalMethodName = resolveMethodName(methodName);

    // TODO: find a way to avoid the payload casting, seems like the Payload type
    // returns a type incompatible with any[]
    if (skip) {
      connection.on(originalMethodName, (...payload) => {
        if (!skip(...(payload as Payload))) {
          callback(...(payload as Payload));
        }
      });
    } else {
      connection.on(originalMethodName, (...payload) => {
        callback(...(payload as Payload));
      });
    }

    if (autoOffInsideComponentScope) {
      // Auto-unregister listener if inside a component
      const instance = getCurrentInstance();
      if (instance) {
        activeListenersSet.add(callback);

        onBeforeUnmount(() => {
          if (activeListenersSet.delete(callback)) {
            off(originalMethodName, callback);
          }
        });
      }
    }
  }

  function off<
    Key extends SignalREventKey,
    Payload extends unknown[] = SignalREventPayload<Key>
  >(methodName: Key, callback?: (...payload: Payload) => void) {
    const originalMethodName = resolveMethodName(methodName);

    if (callback) {
      // TODO: find a way to avoid the payload casting, seems like the Payload type
      // returns a type incompatible with any[]
      connection.off(originalMethodName, (...payload) =>
        callback(...(payload as Payload))
      );
    } else {
      connection.off(originalMethodName);
    }
  }

  return {
    init,
    connected,
    invoke,
    on,
    off,
  };
}
