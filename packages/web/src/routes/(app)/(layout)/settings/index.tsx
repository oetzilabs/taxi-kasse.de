import type { CurrencyCode } from "@/lib/api/application";
import { language, setLanguage } from "@/components/stores/Language";
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger } from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrencies, getLanguage, setPreferedCurrency } from "@/lib/api/application";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { createAsync, revalidate, RouteDefinition, useAction, useSearchParams, useSubmission } from "@solidjs/router";
import DollarSign from "lucide-solid/icons/dollar-sign";
import Languages from "lucide-solid/icons/languages";
import Loader2 from "lucide-solid/icons/loader-2";
import { createSignal, Show, Suspense } from "solid-js";

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
  const session = createAsync(() => getAuthenticatedSession(), { deferStream: true });
  const currencies = createAsync(() => getCurrencies());
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = () => (searchParams.tab as string | undefined) ?? "account";

  const [loading, setLoading] = createSignal(false);

  const setPreferedCurrencyAction = useAction(setPreferedCurrency);
  const setPreferedCurrencyStatus = useSubmission(setPreferedCurrency);

  return (
    <div class="w-full flex flex-col gap-2 h-full grow py-4 lg:pt-0">
      <Suspense
        fallback={
          <div class="flex flex-col w-full py-10 gap-4 items-center justify-center">
            <Loader2 class="size-4 animate-spin" />
          </div>
        }
      >
        <Show when={session() && session()!.user !== null && session()}>
          {(s) => (
            <Tabs
              defaultValue={currentTab()}
              value={currentTab()}
              onChange={(v) => {
                setSearchParams({ tab: v });
              }}
              orientation="vertical"
              class="w-full h-full grow gap-2"
            >
              <TabsList class="min-w-40 w-fit h-fit min-h-[300px] rounded-xl gap-1">
                <TabsTrigger
                  value="account"
                  class="text-left items-start justify-start data-[selected]:font-bold data-[selected]:bg-black data-[selected]:text-white dark:data-[selected]:bg-white dark:data-[selected]:text-black rounded-lg"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  class="text-left items-start justify-start data-[selected]:font-bold data-[selected]:bg-black data-[selected]:text-white dark:data-[selected]:bg-white dark:data-[selected]:text-black rounded-lg"
                >
                  Sessions
                </TabsTrigger>
                <TabsTrigger
                  value="language"
                  class="text-left items-start justify-start data-[selected]:font-bold data-[selected]:bg-black data-[selected]:text-white dark:data-[selected]:bg-white dark:data-[selected]:text-black rounded-lg"
                >
                  Language
                </TabsTrigger>
                <TabsTrigger
                  value="currency"
                  class="text-left items-start justify-start data-[selected]:font-bold data-[selected]:bg-black data-[selected]:text-white dark:data-[selected]:bg-white dark:data-[selected]:text-black rounded-lg"
                >
                  Currency
                </TabsTrigger>
              </TabsList>
              <TabsContent value="account" class="w-full"></TabsContent>
              <TabsContent value="sessions" class="w-full"></TabsContent>
              <TabsContent value="language" class="w-full">
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
                      itemComponent={(props) => (
                        <ComboboxItem item={props.item}>{props.item.rawValue.label}</ComboboxItem>
                      )}
                    >
                      <ComboboxTrigger class="flex flex-row gap-2 items-center h-8 px-2 bg-white dark:bg-black">
                        <Languages class="size-3" />
                        <span class="text-sm">{LANGUAGES.find((l) => l.value === language())?.value}</span>
                      </ComboboxTrigger>
                      <ComboboxContent />
                    </Combobox>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="currency" class="w-full">
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
              </TabsContent>
            </Tabs>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
