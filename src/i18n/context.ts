import { createContext, useContext } from 'react';
import { Locale, zh } from './locales';

export const I18nContext = createContext<Locale>(zh);

export function useI18n() {
  return useContext(I18nContext);
}
