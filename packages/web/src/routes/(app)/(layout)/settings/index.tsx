import type { CurrencyCode } from "@/lib/api/application";
import { language, setLanguage } from "@/components/stores/Language";
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
import { getCurrencies, getLanguage, setPreferedCurrency } from "@/lib/api/application";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { createAsync, revalidate, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Languages from "lucide-solid/icons/languages";
import { createSignal, Show } from "solid-js";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const language = await getLanguage();
    return { session, language };
  },
} satisfies RouteDefinition;

const LANGUAGES = [
  {
    label: "English",
    value: "en-US",
  },
  {
    label: "Deutsch",
    value: "de-DE",
  },
];

export default function Settings() {
  const session = createAsync(() => getAuthenticatedSession());
  const currencies = createAsync(() => getCurrencies());

  const [loading, setLoading] = createSignal(false);

  const setPreferedCurrencyAction = useAction(setPreferedCurrency);
  const setPreferedCurrencyStatus = useSubmission(setPreferedCurrency);

  return (
    <div class="container p-4 flex flex-col gap-2 mx-auto">
      <Show when={session() && session()!.user !== null && session()}>
        {(s) => (
          <div class="flex flex-col gap-8">
            <div class="flex flex-col gap-2">
              <h1 class="text-2xl font-bold">Language</h1>
              <div class="flex flex-row gap-2">
                <Combobox<{ label: string; value: string }>
                  value={LANGUAGES.find((l) => l.value === language())!}
                  disabled={loading()}
                  optionValue="value"
                  optionLabel="label"
                  options={LANGUAGES}
                  onChange={async (v) => {
                    if (!v) return;
                    setLoading(true);
                    setLanguage(v.value);
                    await revalidate([getLanguage.key]);
                    setLoading(false);
                  }}
                  itemComponent={(props) => <ComboboxItem item={props.item}>{props.item.rawValue.label}</ComboboxItem>}
                >
                  <ComboboxTrigger class="flex flex-row gap-2 items-center h-8 px-2 bg-white dark:bg-black">
                    <Languages class="size-3" />
                    <span class="text-sm">{LANGUAGES.find((l) => l.value === language())?.value}</span>
                  </ComboboxTrigger>
                  <ComboboxContent />
                </Combobox>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <h1 class="text-2xl font-bold">Currency</h1>
              <div class="flex flex-row gap-2">
                <Show when={currencies()}>
                  {(cs) => (
                    <Combobox<{ label: string; value: CurrencyCode }>
                      value={cs().find((l) => l.value === s().user!.currency_code)!}
                      disabled={setPreferedCurrencyStatus.pending}
                      optionValue="value"
                      optionLabel="label"
                      options={cs()}
                      onChange={async (v) => {
                        if (!v) return;
                        await setPreferedCurrencyAction(v.value);
                        await revalidate([getAuthenticatedSession.key]);
                      }}
                      itemComponent={(props) => (
                        <ComboboxItem item={props.item}>{props.item.rawValue.label}</ComboboxItem>
                      )}
                    >
                      <ComboboxTrigger class="flex flex-row gap-2 items-center h-8 px-2 bg-white dark:bg-black">
                        <DollarSign class="size-3" />
                        <span class="text-sm">{cs().find((l) => l.value === s().user!.currency_code)?.value}</span>
                      </ComboboxTrigger>
                      <ComboboxContent />
                    </Combobox>
                  )}
                </Show>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
