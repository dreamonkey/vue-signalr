export * from './composable';
export * from './mapping';
export * from './models';
export * from './plugin';
export * from './service';
export * from './symbols';

// These interfaces must be here to ease their augmentation
// even if this creates a circular dependency with models file

/**
 * Use this interface to map Commands (aka server methods) names and their payloads
 *
 * @example
 * ```ts
 * import '@dreamonkey/vue-signalr';
 *
 * interface SendMessagePayload {
 *   message: string;
 * }
 *
 * declare module '@dreamonkey/vue-signalr' {
 *   interface SignalRCommands {
 *     SendMessage: SendMessagePayload, // Define a command and its payload
 *     JoinMainTopic: false, // Define a command with no payload
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SignalRCommands {}

/**
 * Use this interface to map Events (aka client methods) names and their payloads
 *
 * @example
 * ```ts
 * import '@dreamonkey/vue-signalr';
 *
 * interface MessageReceivedPayload {
 *   message: string;
 * }
 *
 * declare module '@dreamonkey/vue-signalr' {
 *   interface SignalREvents {
 *     MessageReceived: MessageReceivedPayload, // Define an event and its payload
 *     MainTopicJoined: false, // Define an event with no payload
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SignalREvents {}
