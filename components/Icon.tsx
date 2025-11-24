import { SvgProps } from 'react-native-svg';

// 아이콘 import (자동 생성됨 - scripts/generate-icons.js)
import BreakfastIcon from '@/assets/icon/breakfast.svg';
import CancelIcon from '@/assets/icon/cancel.svg';
import ClockIcon from '@/assets/icon/clock.svg';
import DinnerIcon from '@/assets/icon/dinner.svg';
import DownAngleIcon from '@/assets/icon/down_angle.svg';
import DropdownIcon from '@/assets/icon/dropdown.svg';
import FilterIcon from '@/assets/icon/filter.svg';
import GoodIcon from '@/assets/icon/good.svg';
import LeftAngleIcon from '@/assets/icon/left_angle.svg';
import LocationIcon from '@/assets/icon/location.svg';
import LunchIcon from '@/assets/icon/lunch.svg';
import MeatballIcon from '@/assets/icon/meatball.svg';
import PinIcon from '@/assets/icon/pin.svg';
import RicericaIcon from '@/assets/icon/ricerica.svg';
import RightAngleIcon from '@/assets/icon/right_angle.svg';
import SchoolIcon from '@/assets/icon/school.svg';
import SearchIcon from '@/assets/icon/search.svg';
import SendIcon from '@/assets/icon/send.svg';
import StarIcon from '@/assets/icon/star.svg';
import TelephoneIcon from '@/assets/icon/telephone.svg';
import TriangleIcon from '@/assets/icon/triangle.svg';
import UpAngleIcon from '@/assets/icon/up_angle.svg';
import WarnningIcon from '@/assets/icon/warnning.svg';

// 아이콘 매핑
const icons = {
  breakfast: BreakfastIcon,
  cancel: CancelIcon,
  clock: ClockIcon,
  dinner: DinnerIcon,
  downAngle: DownAngleIcon,
  dropdown: DropdownIcon,
  filter: FilterIcon,
  good: GoodIcon,
  leftAngle: LeftAngleIcon,
  location: LocationIcon,
  lunch: LunchIcon,
  meatball: MeatballIcon,
  pin: PinIcon,
  ricerica: RicericaIcon,
  rightAngle: RightAngleIcon,
  school: SchoolIcon,
  search: SearchIcon,
  send: SendIcon,
  star: StarIcon,
  telephone: TelephoneIcon,
  triangle: TriangleIcon,
  upAngle: UpAngleIcon,
  warnning: WarnningIcon,
} as const;

export type IconName = keyof typeof icons;

interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 24, width, height, ...props }: IconProps) {
  const IconComponent = icons[name];

  return (
    <IconComponent
      width={width ?? size}
      height={height ?? size}
      {...props}
    />
  );
}
