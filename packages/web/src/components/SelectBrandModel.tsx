import { createVirtualizer } from "@tanstack/solid-virtual";
import { createMemo, createSignal, For, Show } from "solid-js";
import { cn } from "../lib/utils";
import { TextField, TextFieldRoot } from "./ui/textfield";

export type SelectBrandModelProps = {
  brands: Array<{
    group: string;
    models: {
      value: string;
      label: string;
    }[];
  }>;
  value: string | null;
  onChange: (value: string) => void;
};

export const SelectBrandModel = (props: SelectBrandModelProps) => {
  const [searchNameOfVehicle, setSearchNameOfVehicle] = createSignal("");

  let scrollElement: HTMLDivElement | undefined;

  const filterModelsAndBrands = createMemo(() => {
    const request = searchNameOfVehicle();
    if (request.length === 0) return props.brands;
    const result: Array<{
      group: string;
      models: {
        value: string;
        label: string;
      }[];
    }> = [];
    for (let i = 0; i < props.brands.length; i++) {
      const brand = props.brands[i];
      if (brand.group.toLowerCase().includes(request.toLowerCase())) {
        result.push({
          group: brand.group,
          models: brand.models,
        });
        continue;
      } else {
        const models = brand.models;
        const ms: Array<{
          value: string;
          label: string;
        }> = [];
        for (let j = 0; j < models.length; j++) {
          const model = models[j];
          if (model.label.toLowerCase().includes(request.toLowerCase())) {
            ms.push({
              value: model.value,
              label: model.label,
            });
          }
        }
        if (ms.length > 0) {
          result.push({
            group: brand.group,
            models: ms,
          });
          continue;
        }
        result.push({
          group: brand.group,
          models: [],
        });
      }
    }
    const sortedByGroup = result.toSorted((a, b) => a.group.localeCompare(b.group));
    return sortedByGroup;
  });

  const virtualizer = createVirtualizer({
    count: filterModelsAndBrands().length,
    getScrollElement: () => scrollElement!,
    estimateSize: (i) =>
      (Math.floor(filterModelsAndBrands()[i].models.length / 3) +
        (filterModelsAndBrands()[i].models.length % 3 > 0 ? 1 : 0)) *
        130 +
      25,
    overscan: 5,
  });

  return (
    <div class="w-full flex flex-col gap-0 border border-neutral-300 dark:border-neutral-800 rounded-lg overflow-clip">
      <div class="flex flex-row items-center justify-between gap-2 p-2 border-b border-neutral-300 dark:border-neutral-800 w-full">
        <TextFieldRoot
          class="max-w-full w-full"
          value={searchNameOfVehicle()}
          onChange={(value) => {
            setSearchNameOfVehicle(value);
          }}
        >
          <TextField class="max-w-full w-full" placeholder="Search for a Model" />
        </TextFieldRoot>
      </div>
      <Show
        when={filterModelsAndBrands().length > 0 && filterModelsAndBrands()}
        fallback={
          <div class="text-sm text-muted-foreground p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg min-w-[200px] items-center justify-center flex select-none">
            No models available at this moment
          </div>
        }
        keyed
      >
        {(brands) => (
          <div class="flex flex-col gap-2 w-full h-80 overflow-y-auto overflow-x-clip p-2" ref={scrollElement!}>
            <div
              class="w-full relative"
              style={{
                height: `${virtualizer.getTotalSize()}px`,
              }}
            >
              <For each={virtualizer.getVirtualItems()}>
                {(item) => (
                  <Show when={item.index > -1 && brands[item.index].models.length > 0 && brands[item.index]}>
                    {(brand) => (
                      <div
                        class="flex flex-col gap-2 px-2 w-full absolute top-0 left-0 "
                        style={{
                          width: "100%",
                          height: `${item.size}px`,
                          transform: `translateY(${item.start}px)`,
                        }}
                      >
                        <div class="flex flex-row items-center gap-2 w-full">
                          <span class="text-xs font-bold text-muted-foreground">{brand().group}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2 w-full">
                          <For each={brand().models}>
                            {(model) => (
                              <div
                                class={cn(
                                  "flex flex-col items-center gap-2 border border-neutral-300 dark:border-neutral-800 rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer",
                                  {
                                    "border-blue-500": model.value === props.value,
                                  },
                                )}
                                onClick={() => {
                                  if (model.value === props.value) {
                                    props.onChange("");
                                    return;
                                  } else {
                                    props.onChange(model.value);
                                  }
                                }}
                              >
                                <span class="text-xs font-semibold w-full text-wrap">{model.label}</span>
                                <div class="bg-neutral-200 dark:bg-neutral-800 h-20 w-full rounded-md"></div>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    )}
                  </Show>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};
