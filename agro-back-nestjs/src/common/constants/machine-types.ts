// import { MACHINE_GROUPS, type MachineType } from './machine-groups';

import { MACHINE_GROUPS, MachineType } from "./machine-groupps";

type Group = { readonly items: readonly { readonly value: MachineType }[] };

// Tipo común para evitar la unión de tuplas del `as const`
const GROUPS: readonly Group[] = MACHINE_GROUPS;

export const MACHINE_TYPES: readonly MachineType[] = GROUPS.flatMap((g) =>
    g.items.map((i) => i.value),
);