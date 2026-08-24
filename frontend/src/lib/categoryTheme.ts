import {
  Book,
  Briefcase,
  Car,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  PawPrint,
  PiggyBank,
  Receipt,
  ShoppingBasket,
  ShoppingCart,
  Tag,
  Ticket,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * As 7 cores do seletor do modal "Nova categoria", na mesma ordem do Figma.
 * `base` e o que fica salvo no banco; `light`/`dark` montam a tag da categoria.
 */
export const CATEGORY_COLORS = [
  { name: 'green', base: '#16A34A', dark: '#15803D', light: '#E0FAE9' },
  { name: 'blue', base: '#2563EB', dark: '#1D4ED8', light: '#DBEAFE' },
  { name: 'purple', base: '#9333EA', dark: '#7E22CE', light: '#F3E8FF' },
  { name: 'pink', base: '#DB2777', dark: '#BE185D', light: '#FCE7F3' },
  { name: 'red', base: '#DC2626', dark: '#B91C1C', light: '#FEE2E2' },
  { name: 'orange', base: '#EA580C', dark: '#C2410C', light: '#FFEDD5' },
  { name: 'yellow', base: '#CA8A04', dark: '#A16207', light: '#F7F3CA' },
] as const;

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0].base;
export const DEFAULT_CATEGORY_ICON = 'tag';

export interface CategoryPalette {
  base: string;
  dark: string;
  light: string;
}

const FALLBACK: CategoryPalette = { base: '#6B7280', dark: '#374151', light: '#E5E7EB' };

/**
 * Resolve a paleta a partir da cor salva. Aceita qualquer um dos tres tons,
 * então uma categoria criada antes com o tom `dark` continua renderizando certo.
 */
export function paletteFor(color: string): CategoryPalette {
  const target = color.toUpperCase();
  const found = CATEGORY_COLORS.find(
    (entry) => entry.base === target || entry.dark === target || entry.light === target,
  );
  return found ? { base: found.base, dark: found.dark, light: found.light } : { ...FALLBACK, base: color };
}

/** Ícones disponíveis no seletor do modal, todos do Lucide. */
export const CATEGORY_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'utensils', Icon: Utensils },
  { name: 'shopping-cart', Icon: ShoppingCart },
  { name: 'shopping-basket', Icon: ShoppingBasket },
  { name: 'car', Icon: Car },
  { name: 'house', Icon: House },
  { name: 'receipt', Icon: Receipt },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'wallet', Icon: Wallet },
  { name: 'piggy-bank', Icon: PiggyBank },
  { name: 'heart-pulse', Icon: HeartPulse },
  { name: 'ticket', Icon: Ticket },
  { name: 'gift', Icon: Gift },
  { name: 'book', Icon: Book },
  { name: 'dumbbell', Icon: Dumbbell },
  { name: 'paw-print', Icon: PawPrint },
  { name: 'tag', Icon: Tag },
];

const ICON_MAP = new Map(CATEGORY_ICONS.map((entry) => [entry.name, entry.Icon]));

export function iconFor(name?: string | null): LucideIcon {
  return (name && ICON_MAP.get(name)) || Tag;
}
