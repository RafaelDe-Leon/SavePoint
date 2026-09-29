import {
  ArrowUpDown,
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheckBig,
  Cloud,
  CloudDownload,
  Disc3,
  Eye,
  EyeOff,
  Info,
  Layers,
  Flag,
  Gamepad2,
  GripVertical,
  Heart,
  Image,
  LayoutGrid,
  Library,
  List,
  ListPlus,
  Lock,
  Mail,
  Minus,
  Pause,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Star,
  Trash2,
  TriangleAlert,
  Trophy,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Savepoint uses Lucide. The design system addresses glyphs by kebab-case name
 * (`<Icon name="gamepad-2" />`); this registry preserves that API while keeping
 * the bundle tree-shakeable — only icons listed here ship.
 *
 * To add a glyph: import it above and add one line here.
 */
const ICONS = {
  "arrow-up-down": ArrowUpDown,
  bell: Bell,
  bookmark: Bookmark,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  circle: Circle,
  "circle-check-big": CircleCheckBig,
  cloud: Cloud,
  "cloud-download": CloudDownload,
  "disc-3": Disc3,
  eye: Eye,
  "eye-off": EyeOff,
  info: Info,
  layers: Layers,
  flag: Flag,
  "gamepad-2": Gamepad2,
  "grip-vertical": GripVertical,
  heart: Heart,
  image: Image,
  "layout-grid": LayoutGrid,
  library: Library,
  list: List,
  "list-plus": ListPlus,
  lock: Lock,
  mail: Mail,
  minus: Minus,
  pause: Pause,
  plus: Plus,
  "rotate-ccw": RotateCcw,
  search: Search,
  settings: Settings,
  star: Star,
  "trash-2": Trash2,
  "triangle-alert": TriangleAlert,
  trophy: Trophy,
  user: User,
  x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  /** Rendered at 14–20px across the system. */
  size?: number;
  /** Lucide is drawn at 1.5–2px stroke. */
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.75,
  className,
  ...rest
}: IconProps) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      {...rest}
    />
  );
}
