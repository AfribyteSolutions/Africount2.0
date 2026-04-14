import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'sw', name: 'Kiswahili' },
  { code: 'ar', name: 'العربية' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLanguageMutation = trpc.user.setLanguage.useMutation();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Update in backend
      await setLanguageMutation.mutateAsync({ language: languageCode });
      // Update i18n
      await i18n.changeLanguage(languageCode);
      // Update HTML lang attribute
      document.documentElement.lang = languageCode;
      // Update text direction for Arabic
      if (languageCode === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
