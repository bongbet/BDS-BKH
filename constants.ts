import { ListingStatus, ListingType, PropertyType, UserRole } from './types';

export const USER_ROLES = [
  { value: UserRole.BUYER, label: 'Người mua' },
  { value: UserRole.AGENT, label: 'Môi giới / Chủ nhà' },
];

export const LISTING_TYPES = [
  { value: ListingType.SALE, label: 'Bán' },
  { value: ListingType.RENT, label: 'Thuê' },
];

export const PROPERTY_TYPES = [
  { value: PropertyType.APARTMENT, label: 'Căn hộ' },
  { value: PropertyType.HOUSE, label: 'Nhà phố' },
  { value: PropertyType.LAND, label: 'Đất' },
  { value: PropertyType.OFFICE, label: 'Văn phòng' },
  { value: PropertyType.SHOPHOUSE, label: 'Shophouse' },
  { value: PropertyType.VILLA, label: 'Biệt thự' },
];

export const LISTING_STATUSES = [
  { value: ListingStatus.ACTIVE, label: 'Đang hiển thị' },
  { value: ListingStatus.SOLD, label: 'Đã bán' },
  { value: ListingStatus.RENTED, label: 'Đã cho thuê' },
  { value: ListingStatus.EXPIRED, label: 'Hết hạn' },
];

export const PRICE_UNITS = [
  { value: 'VND', label: 'VNĐ' },
  { value: 'USD', label: 'USD' },
  { value: '/tháng', label: '/ tháng' },
];

export const DEFAULT_AVATAR_URL = 'https://picsum.photos/40/40?grayscale';
export const DEFAULT_LISTING_IMAGE_URL = 'https://picsum.photos/800/600?random=1';