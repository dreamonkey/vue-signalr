import { inject } from "vue";
import { SignalRSymbol } from "./symbols";

export function useSignalR() {
  const signalr = inject(SignalRSymbol);

  if (!signalr) {
    throw new Error("Failed to inject SignalR");
  }

  return signalr;
}
