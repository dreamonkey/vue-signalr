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
        // "action?.()" syntax isn't transpiled by TS due to esnext target
        // and would break projects using the package
        action && action();
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

  function on<Key extends SignalREventKey>(
    methodName: Key,
    callback: (...payload: SignalREventPayload<Key>) => void,
    { skip, once }: SignalROnOptions<SignalREventPayload<Key>> = {}
  ) {
    const originalMethodName = resolveMethodName(methodName);

    connection.on(originalMethodName, (...payload) => {
      // Needed to make TS happy with a cast
      const _payload = payload as Parameters<typeof callback>;
      if (skip && skip(..._payload)) {
        return;
      }

      if (once) {
        off(methodName, callback);
      }

      callback(..._payload);
    });

    if (autoOffInsideComponentScope) {
      // Auto-unregister listener if inside a component
      const instance = getCurrentInstance();
      if (instance) {
        activeListenersSet.add(callback);

        onBeforeUnmount(() => {
          if (activeListenersSet.delete(callback)) {
            off(methodName, callback);
          }
        });
      }
    }
  }

  function once<Key extends SignalREventKey>(
    methodName: Key,
    callback: (...payload: SignalREventPayload<Key>) => void,
    options: SignalROnOptions<SignalREventPayload<Key>> = {}
  ) {
    on<Key>(methodName, callback, { ...options, once: true });
  }

  function off<Key extends SignalREventKey>(
    methodName: Key,
    callback?: (...payload: SignalREventPayload<Key>) => void
  ) {
    const originalMethodName = resolveMethodName(methodName);

    if (callback) {
      connection.off(originalMethodName, (...payload) => {
        // Needed to make TS happy with a cast
        const _payload = payload as Parameters<typeof callback>;
        callback(..._payload);
      });
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
    once,
  };
}
