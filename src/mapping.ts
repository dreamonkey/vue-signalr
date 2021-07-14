import { SignalRMethodKey } from './models';

const methodNamesMap = new Map<string, string>();

export function remapMethod(name: string, alias: SignalRMethodKey) {
  methodNamesMap.set(alias, name);
}

export function remapMethods(
  mappings: [name: string, newName: SignalRMethodKey][]
) {
  for (const [name, newName] of mappings) {
    remapMethod(name, newName);
  }
}

export function resolveMethodName(name: string) {
  return methodNamesMap.get(name) ?? name;
}
