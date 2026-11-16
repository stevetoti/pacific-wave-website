export type CourseLanguage = 'en' | 'bi' | 'fr';
export function parseCourseLanguage(value: unknown): CourseLanguage {
  return value === 'bi' || value === 'fr' ? value : 'en';
}
const templates = [
  { key: 'Week {number}', match: /^Week (\d+)$/, variables: ['number'] },
  { key: '{count} lessons', match: /^(\d+) lessons$/, variables: ['count'] },
  { key: '{count} weeks', match: /^(\d+) weeks$/, variables: ['count'] },
  { key: '{count} months', match: /^(\d+) months?$/, variables: ['count'] },
  { key: 'Welcome back, {name}.', match: /^Welcome back, (.+)\.$/, variables: ['name'] },
  { key: 'This class has {count} parts. Select a video below to watch in order.', match: /^This class has (\d+) parts\. Select a video below to watch in order\.$/, variables: ['count'] },
  { key: 'Part {number}', match: /^Part (\d+)$/, variables: ['number'] },
] as const;
/** Translate authored copy; unknown text and user-entered values stay unchanged. */
export function translateCourseText(text: string, language: CourseLanguage, dictionaries: Partial<Record<CourseLanguage, Record<string, string>>>): string {
  if (language === 'en') return text;
  const normalized = text.replace(/\s+/g, ' ').trim();
  const dictionary = dictionaries[language];
  if (!dictionary) return text;
  if (dictionary[normalized]) return dictionary[normalized];
  for (const template of templates) {
    const match = normalized.match(template.match);
    const translated = dictionary[template.key];
    if (match && translated) {
      return template.variables.reduce((value, key, i) => value.replace(`{${key}}`, () => match[i + 1]), translated);
    }
  }
  return text;
}
