export type IAttentionType = 'BAR' | 'POPUP' | 'CORNER' | 'REPLACE' | 'PREPEND' | 'APPEND';

export type IBARPositionType = 'TOP' | 'TOP_FIXED' | 'BOTTOM' | 'BOTTOM_FIXED' | 'FIXED';

export type ICornerPositionType = 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';

export type IPopupPositionType = null;

export type IPopupSizeType = 'SM' | 'MD' | 'LG' | 'FULL' | 'CUSTOM';

export type INewPopupSizeType = 'small' | 'medium' | 'large' | 'full' | 'custom';

export interface ISize {
  type: IPopupSizeType | INewPopupSizeType;
  width?: number;
}

export enum SizeType {
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
  FULL = 'FULL',
  CUSTOM = 'CUSTOM',
}

export enum NewSizeType {
  SM = 'small',
  MD = 'medium',
  LG = 'large',
  FULL = 'full',
  CUSTOM = 'custom',
}

export enum DisplayTimeType {
  TIME_SPEND = 'time_spend',
  PAGE_SCROLLING = 'page_scrolling',
}

export enum AttentionType {
  BAR = 'BAR',
  POPUP = 'POPUP',
  CORNER = 'CORNER',
  REPLACE = 'REPLACE',
  PREPEND = 'PREPEND',
  APPEND = 'APPEND',
}

export interface IDisplayTimeSpend {
  type: DisplayTimeType.TIME_SPEND;
  minute: number;
  second: number;
}

export interface IDisplayPageScrolling {
  type: DisplayTimeType.PAGE_SCROLLING;
  percent: number;
}

export interface IAttentionItemOptions {
  type: IAttentionType;
  position: IBARPositionType | ICornerPositionType | IPopupPositionType;
  container_id?: string;
  css_selector?: string;
  size: ISize;
  allow_backdrop_click?: boolean;
  backdrop_opacity: number | null;
  is_borderless: boolean;
  display_after: {
    type: 'time_spend' | 'page_scrolling';
    second?: number;
    percent?: number;
  };
}

export interface IAttentionItem {
  html: string;
  css: string;
  custom_css: string;
  js: string;
  options: IAttentionItemOptions;
}
