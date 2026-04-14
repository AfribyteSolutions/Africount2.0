import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CurrencySwitcher() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const setCurrencyMutation = trpc.user.setCurrency.useMutation();
  const preferencesQuery = trpc.user.getPreferences.useQuery();
  const currenciesQuery = trpc.currency.list.useQuery();

  useEffect(() => {
    if (preferencesQuery.data?.currency) {
      setSelectedCurrency(preferencesQuery.data.currency);
    }
  }, [preferencesQuery.data]);

  const handleCurrencyChange = async (currencyCode: string) => {
    try {
      setSelectedCurrency(currencyCode);
      await setCurrencyMutation.mutateAsync({ currency: currencyCode });
      // Store in localStorage for persistence
      localStorage.setItem('selectedCurrency', currencyCode);
    } catch (error) {
      console.error('Failed to change currency:', error);
      // Revert on error
      if (preferencesQuery.data?.currency) {
        setSelectedCurrency(preferencesQuery.data.currency);
      }
    }
  };

  if (currenciesQuery.isLoading) {
    return <div>Loading currencies...</div>;
  }

  return (
    <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currenciesQuery.data?.map((currency: any) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
