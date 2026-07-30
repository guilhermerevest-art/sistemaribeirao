// Mapeamento de categoria → ícone Lucide. Usado pelos chips da loja
// e pela sidebar/header do backoffice.

import {
  Beef,
  Drumstick,
  Apple,
  Milk,
  Snowflake,
  ShoppingBasket,
  Cookie,
  Beer,
  ChevronDown,
  Flame,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { Categoria } from './types';

export const CATEGORIA_ICONE: Record<Categoria, LucideIcon> = {
  bovino: Beef,
  suino: Drumstick,
  aves: Drumstick,
  embutidos: UtensilsCrossed,
  preparados: UtensilsCrossed,
  churrasco: Flame,
};

export const CATEGORIA_LABELS_LONG: Record<Categoria, string> = {
  bovino: 'Carnes bovinas',
  suino: 'Carnes suínas',
  aves: 'Aves',
  embutidos: 'Embutidos',
  preparados: 'Preparados',
  churrasco: 'Churrasco',
};

// Categorias do empório (usadas no admin, mas deixo o mapping de ícone
// para evitar warnings quando elas existirem no tipo).
export const OUTROS_ICONES: Record<string, LucideIcon> = {
  hortifruti: Apple,
  laticinios: Milk,
  frios: Snowflake,
  mercearia: ShoppingBasket,
  petiscos: Cookie,
  bebidas: Beer,
};

export { ChevronDown };
