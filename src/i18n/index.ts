import hi from './locales/hi.json';
import ur from './locales/ur.json';

export const resources = {
  hi,
  ur,
};

export type LocaleKey = keyof typeof hi;
export default resources;
