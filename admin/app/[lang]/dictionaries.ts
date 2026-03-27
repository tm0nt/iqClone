import 'server-only';

const dictionaries = {
  pt: () => import('../../dictionaries/dashboard/pt.json').then((module) => module.default),
  en: () => import('../../dictionaries/dashboard/en.json').then((module) => module.default),
  es: () => import('../../dictionaries/dashboard/es.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  // Fallback para 'pt' se locale inválido
  const dictFunc = dictionaries[locale as keyof typeof dictionaries] || dictionaries.pt;
  return dictFunc();
};
