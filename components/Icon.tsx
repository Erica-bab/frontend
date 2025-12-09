import { SvgProps } from 'react-native-svg';

// 아이콘 import (자동 생성됨 - scripts/generate-icons.js)
import BookmarkIcon from '@/assets/icon/bookmark.svg';
import Bookmark1Icon from '@/assets/icon/bookmark_1.svg';
import BreakfastIcon from '@/assets/icon/breakfast.svg';
import CameraIcon from '@/assets/icon/camera.svg';
import CancelIcon from '@/assets/icon/cancel.svg';
import ChatIcon from '@/assets/icon/chat.svg';
import ClockIcon from '@/assets/icon/clock.svg';
import DinnerIcon from '@/assets/icon/dinner.svg';
import DocsIcon from '@/assets/icon/docs.svg';
import DownAngleIcon from '@/assets/icon/down_angle.svg';
import DropdownIcon from '@/assets/icon/dropdown.svg';
import EditIcon from '@/assets/icon/edit.svg';
import FilterIcon from '@/assets/icon/filter.svg';
import FilterSelectedIcon from '@/assets/icon/filter_selected.svg';
import GalleryIcon from '@/assets/icon/gallery.svg';
import GoodIcon from '@/assets/icon/good.svg';
import GoodFilledIcon from '@/assets/icon/good_filled.svg';
import LeftAngleIcon from '@/assets/icon/left_angle.svg';
import LocationIcon from '@/assets/icon/location.svg';
import LunchIcon from '@/assets/icon/lunch.svg';
import MailIcon from '@/assets/icon/mail.svg';
import MeatballIcon from '@/assets/icon/meatball.svg';
import MoneyIcon from '@/assets/icon/money.svg';
import PaperIcon from '@/assets/icon/paper.svg';
import PeopleIcon from '@/assets/icon/people.svg';
import PickupIcon from '@/assets/icon/pickup.svg';
import PinIcon from '@/assets/icon/pin.svg';
import ReplyIcon from '@/assets/icon/reply.svg';
import RicericaIcon from '@/assets/icon/ricerica.svg';
import RightAngleIcon from '@/assets/icon/right_angle.svg';
import RouletteIcon from '@/assets/icon/roulette.svg';
import RoundIcon from '@/assets/icon/round.svg';
import SchoolIcon from '@/assets/icon/school.svg';
import SearchIcon from '@/assets/icon/search.svg';
import SendIcon from '@/assets/icon/send.svg';
import ShareIcon from '@/assets/icon/share.svg';
import StandIcon from '@/assets/icon/stand.svg';
import StarIcon from '@/assets/icon/star.svg';
import TelephoneIcon from '@/assets/icon/telephone.svg';
import TriangleIcon from '@/assets/icon/triangle.svg';
import UpAngleIcon from '@/assets/icon/up_angle.svg';
import WarnningIcon from '@/assets/icon/warnning.svg';

// 아이콘 매핑
const icons = {
  bookmark: BookmarkIcon,
  bookmark1: Bookmark1Icon,
  breakfast: BreakfastIcon,
  camera: CameraIcon,
  cancel: CancelIcon,
  chat: ChatIcon,
  clock: ClockIcon,
  dinner: DinnerIcon,
  docs: DocsIcon,
  downAngle: DownAngleIcon,
  dropdown: DropdownIcon,
  edit: EditIcon,
  filter: FilterIcon,
  filterSelected: FilterSelectedIcon,
  gallery: GalleryIcon,
  good: GoodIcon,
  goodFilled: GoodFilledIcon,
  leftAngle: LeftAngleIcon,
  location: LocationIcon,
  lunch: LunchIcon,
  mail: MailIcon,
  meatball: MeatballIcon,
  money: MoneyIcon,
  paper: PaperIcon,
  people: PeopleIcon,
  pickup: PickupIcon,
  pin: PinIcon,
  reply: ReplyIcon,
  ricerica: RicericaIcon,
  rightAngle: RightAngleIcon,
  roulette: RouletteIcon,
  round: RoundIcon,
  school: SchoolIcon,
  search: SearchIcon,
  send: SendIcon,
  share: ShareIcon,
  stand: StandIcon,
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
