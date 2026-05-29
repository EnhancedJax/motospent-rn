import {
  ArrowsHorizontal,
  ArrowBendDoubleUpRight,
  BatteryHigh,
  BatteryWarning,
  CircleDashed,
  CircleHalf,
  Disc,
  Drop,
  ForkKnife,
  Funnel,
  GasPump,
  Lightning,
  LinkSimple,
  Pipe,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  SteeringWheel,
  Thermometer,
  WaveSawtooth,
  Wind,
  type IconProps,
} from 'phosphor-react-native';
import React from 'react';

import { useTheme } from '@/hooks/use-theme';

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  LinkSimple,
  Drop,
  Wind,
  CircleHalf,
  Disc,
  Lightning,
  Thermometer,
  SlidersHorizontal,
  Funnel,
  ForkKnife,
  WaveSawtooth,
  ArrowsHorizontal,
  CircleDashed,
  SteeringWheel,
  ArrowBendDoubleUpRight,
  BatteryHigh,
  BatteryWarning,
  Pipe,
  ShieldCheck,
  GasPump,
};

type ExpenseItemIconProps = {
  iconKey: string | null;
  size?: number;
};

export function ExpenseItemIcon({ iconKey, size = 20 }: ExpenseItemIconProps) {
  const theme = useTheme();
  const IconComponent = iconKey ? (ICON_MAP[iconKey] ?? Receipt) : Receipt;

  return <IconComponent size={size} color={theme.textSecondary} weight="regular" />;
}
