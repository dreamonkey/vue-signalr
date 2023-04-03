# vue-signalr

A Vue3 plugin which wraps SignalR and provider stricter typings.

## Installation

Install this package and SignalR peer dependency

`$ yarn add @dreamonkey/vue-signalr @microsoft/signalr`

Apply the plugin providing a `HubConnection` instance

```ts
import { VueSignalR } from '@dreamonkey/vue-signalr';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { createApp } from 'vue';
import App from './App.vue';

// Create your connection
// See https://docs.microsoft.com/en-us/javascript/api/@microsoft/signalr/hubconnectionbuilder
const connection = new HubConnectionBuilder()
  .withUrl('http://localhost:5000/signalr')
  .build();

createApp(App).use(VueSignalR, { connection }).mount('#app');
```

## Usage

```ts
import { useSignalR } from '@dreamonkey/vue-signalr';
import { inject } from 'vue';

export default {
  setup() {
    const signalr = useSignalR();

    signalr.invoke('SendMessage', { message });

    signalr.on('MessageReceived', ({ message }) => {
      /* do stuff */
    });
  },
};
```

While SignalR doesn't make a distinction between client side and server side methods, into this package we refer the formers as "Events" and the latters as "Commands".

Commands can be sent using `signalr.invoke()`, while events can be enabled or disabled using `signalr.on()` and `signalr.off()`

<!-- TODO: explain `skip` and `once` -->

#### Unsubscribing

All Event you create a listener for using `signalr.on()` must be unsubscribed when not used anymore, to avoid memory leaks and erratic code behavior.
If you call `signalr.on()` within a Vue component `setup` scope, the listener will be unsubscribed automatically into `onBeforeUnmount` hook.
This behavior can be disabled via `autoOffInsideComponentScope` plugin option.

If you disabled it, or you start a listener outside a component scope, you'll need to unsubscribe it manually using `signal.off()` and providing **the same listener function reference** to it.
Not providing it will remove all listeners from the provided Event

```ts
const messageReceivedCallback = (message) => console.log(message.prop);

signalr.on('MessageReceived', messageReceivedCallback);

signalr.off('MessageReceived', messageReceivedCallback); // Remove this listener
signalr.off('MessageReceived'); // Remove all listeners on `MessageReceived` event
```

### Type-safety

Command and Events names and payloads are registered via type augmentation of dedicated interfaces (`SignalREvents` and `SignalRCommands`) into `@dreamonkey/vue-signalr` scope.
These types are later used to provide you autocompletion.

**The package works with plain strings too, you're not required to register Commands/Events typings**

```ts
import '@dreamonkey/vue-signalr';

interface MessageReceivedPayload {
  message: string;
}

interface SendMessagePayload {
  message: string;
}

declare module '@dreamonkey/vue-signalr' {
  interface SignalREvents {
    // Define an event, its payload is a single parameter of type `MessageReceivedPayload`
    MessageReceived: MessageReceivedPayload;
    // Define an event, its payload is composed by 0 or more parameters of type `MessageReceivedPayload`
    MultipleMessagesReceived: MessageReceivedPayload[];
    // Define an event, its payload is composed by exactly 2 parameters of type `MessageReceivedPayload`
    TwoMessagesReceived: [MessageReceivedPayload, MessageReceivedPayload];
    // Define an event with no payload
    MainTopicJoined: false;
  }

  interface SignalRCommands {
    // Define a command and its payload
    SendMessage: SendMessagePayload;
    // Define a command with no payload
    JoinMainTopic: false;
  }
}
```

### Methods remapping

In case you need to remap a Command or Event name, you could do so using `remapMethod` or `remapMethods` helpers

```ts
import { remapMethod } from '@dreamonkey/vue-signalr';

remapMethod('receiveMessageWithStrangeMethodName', 'MessageReceived');

remapMethods([
  ['legacyTopic2Joined', 'MainTopicJoined'],
  ['createNewMessage', 'SendMessage'],
]);
```

### Error Handling

You can react to connection/reconnection errors providing a `failFn` option into the plugin options

```ts
import { VueSignalR } from '@dreamonkey/vue-signalr';
import { createApp } from 'vue';
import App from './App.vue';

const connection = new HubConnectionBuilder()
  .withUrl('http://localhost:5000/signalr')
  .build();

createApp(App)
  .use(VueSignalR, {
    connection,
    failFn: () => {
      /* do stuff */
    },
  })
  .mount('#app');
```

### Possible next steps

- take inspiration from other helpers into https://socket.io/docs/v4/listening-to-events/
- take inspiration from other features at the end of https://socket.io/docs/v4/how-it-works/
- add rooms join/leave abstractions (?)

### Credits

This package has been inspired by https://github.com/quangdaon/vue-signalr
