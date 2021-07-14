import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';
import { resolveMethodName } from './mapping';
import {
  SignalRCommandKey,
  SignalRCommandPayload,
  SignalREventKey,
  SignalREventPayload,
  VueSignalRConfig,
  SignalROnOptions,
} from './models';

// TODO: support rest signature for on, off and invoke payloads

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

  function invoke<
    Key extends SignalRCommandKey,
    Payload = SignalRCommandPayload<Key>
  >(methodName: Key, payload: Payload) {
    return new Promise((resolve, reject) => {
      const invokeFn = () =>
        connection
          .invoke(resolveMethodName(methodName), payload)
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

  function on<Key extends SignalREventKey, Payload = SignalREventPayload<Key>>(
    methodName: Key,
    callback: (args: Payload) => void,
    { skip }: SignalROnOptions<Payload> = {}
  ) {
    const originalMethodName = resolveMethodName(methodName);

    if (skip) {
      connection.on(originalMethodName, (args: Payload) => {
        if (!skip(args)) {
          callback(args);
        }
      });
    } else {
      connection.on(originalMethodName, callback);
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

  function off<Key extends SignalREventKey, Payload = SignalREventPayload<Key>>(
    methodName: Key,
    callback?: (args: Payload) => void
  ) {
    const originalMethodName = resolveMethodName(methodName);

    if (callback) {
      connection.off(originalMethodName, callback);
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
