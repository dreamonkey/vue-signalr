import { useSignalR, remapMethod, remapMethods } from '../src';

interface MessageReceivedPayload {
  message: string;
}

interface SendMessagePayload {
  message: string;
}

declare module '../src' {
  interface SignalREvents {
    MessageReceived: MessageReceivedPayload;
    MultipleMessagesReceived: MessageReceivedPayload[];
    TwoMessagesReceived: [MessageReceivedPayload, MessageReceivedPayload];
    MainTopicJoined: false;
  }

  interface SignalRCommands {
    SendMessage: SendMessagePayload;
    JoinMainTopic: false;
  }
}

// Map an old strange method name to an alias
remapMethod('JoinLegacyTopicV2', 'MainTopicJoined');
// Maps the same method name to 2 different aliases
remapMethods([
  ['sendStrangeMessage', 'SendMessageFromPageOne'],
  ['sendStrangeMessage', 'SendMessageFromPageTwo'],
]);

const signalr = useSignalR();

// The payload have a single parameter of type MessageReceivedPayload
signalr.on('MessageReceived', ({ message }) => {
  console.log(message);
});
// The payload have a 0 or more parameters of type MessageReceivedPayload
signalr.on('MultipleMessagesReceived', (...messages) => {
  console.log(messages.length);
});
// The payload have exactly 2 parameters of type MessageReceivedPayload
signalr.on(
  'TwoMessagesReceived',
  ({ message: message1 }, { message: message2 }) => {
    console.log(message1, message2);
  }
);
// The payload have no params, type 'never'
signalr.on('MainTopicJoined', (undefinedParam) => {
  console.log(undefinedParam);
});
// Types not provided, fallback to a payload of type 'any[]'
signalr.on('RandomEvent', (...params) => {
  console.log(params);
});

// @ts-expect-error Error due to the missing payload
void signalr.invoke('SendMessage');
// Provide correct payload
void signalr.invoke('SendMessage', { message: 'Message' });
// @ts-expect-error Error due to excess payload
void signalr.invoke('JoinMainTopic', {});
// Don't provide any payload
void signalr.invoke('JoinMainTopic');
// Types not provided, fallback to a payload of type 'any[]'
void signalr.invoke('RandomCommand', 'Data!', 'More!');
