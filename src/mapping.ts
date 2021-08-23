const methodNamesMap = new Map<string, string>();

export function remapMethod(name: string, alias: string) {
  methodNamesMap.set(alias, name);
}

export function remapMethods(mappings: [name: string, alias: string][]) {
  for (const [name, alias] of mappings) {
    remapMethod(name, alias);
  }
}

export function resolveMethodName(nameOrAlias: string) {
  return methodNamesMap.get(nameOrAlias) || nameOrAlias;
}
