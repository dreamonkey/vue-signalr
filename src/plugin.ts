import { App } from "vue";
import { VueSignalRConfig } from "./models";
import { createService } from "./service";
import { SignalRSymbol } from "./symbols";

export const VueSignalR = {
  install(app: App, options: VueSignalRConfig) {
    const service = createService(options);

    app.provide(SignalRSymbol, service);

    void service.init();
  },
};
