import hi from './locales/hi.json';
import ur from './locales/ur.json';
import en from './locales/en.json';

export const resources = {
  hi,
  ur,
  en,
};

export type LocaleKey = keyof typeof hi;
export default resources;
