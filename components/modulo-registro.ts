import { ComponentType } from "react";
import Modulo01Exemplo00 from "./modulo_01/exemplo_00";
import Modulo01Exemplo01 from "./modulo_01/exemplo_01";

export type ExampleComponent = ComponentType;

export const moduloRegistry = {
  modulo_01: {
    exemplo_00: Modulo01Exemplo00,
    exemplo_01: Modulo01Exemplo01,
  },
} as const;

export function isModulo(value: string): value is keyof typeof moduloRegistry {
  return value in moduloRegistry;
}
