import { VueSignalRConfig } from './models';
import { App } from 'vue';
import { createService } from './service';
import { SignalRSymbol } from './symbols';

export const VueSignalR = {
  install(app: App, options: VueSignalRConfig) {
    const service = createService(options);

    app.provide(SignalRSymbol, service);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    service.init();
  },
};
