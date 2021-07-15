const methodNamesMap = new Map<string, string>();

export function remapMethod(name: string, alias: string) {
  methodNamesMap.set(alias, name);
}

export function remapMethods(mappings: [name: string, newName: string][]) {
  for (const [name, newName] of mappings) {
    remapMethod(name, newName);
  }
}

export function resolveMethodName(name: string) {
  return methodNamesMap.get(name) ?? name;
}
