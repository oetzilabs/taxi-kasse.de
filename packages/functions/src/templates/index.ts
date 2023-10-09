import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Logo } from "./logo";
import { Style } from "./style";
import { DayEntrySelect } from "@taxi-kassede/core/drizzle/sql/schema";
import { User } from "@taxi-kassede/core/entities/users";
import { tailwindcssScript } from "./tailwindcssScript";
dayjs.extend(advancedFormat);

export * as Template from "./index";

const Base = async (content: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <script>
    ${await tailwindcssScript()}
    </script>
  </head>
  <body>
    <div class="flex flex-col w-full p-[20px] h-full">
      ${content}
    </div>
  </body>
</html>`;

export const Simple = async () =>
  await Base(`<div class="flex w-full h-full flex-col gap-[20px] p-[20px] pl-[80px]">
  <div class="flex w-full flex-col justify-between gap-[20px]">
      <div class="flex flex-row gap-[8px]">
          <div class="bg-neutral-200" style="width:100%;height:18px;"></div>
          <div class="bg-neutral-500" style="width:8px;height:18px;"></div>
          <div class="bg-neutral-700" style="width:8px;height:18px;"></div>
          <div class="bg-neutral-950" style="width:max-content;height:18px;">
            ${Logo()}
          </div>
      </div>
      <div class="flex flex-row items-start justify-between">
          <div class="flex flex-col gap-[20px]">
              <div class="flex flex-col">
                  <h2 class="text-xs font-semibold">{{company}}</h2>
                  <h2 class="text-xs">{{user}}</h2>
                  <h2 class="text-xs">{{contact}}</h2>
              </div>
          </div>
          <div class="flex h-fit w-fit flex-col gap-[5px] bg-neutral-100 p-[10px] text-[8pt]">
              <span class="">Report-Nr.: {{reportnumber}}</span>
              <span class="">{{today}}</span>
          </div>
      </div>
      <div class="flex flex-col w-full text-[8pt] text-justify">
        {{intro locale}}
      </div>
      <div class="flex flex-col w-full">
          <table class="w-full table-auto">
              <thead class="bg-neutral-700 text-white">
                  <tr class="">
                      <th class="w-min p-1 text-left text-[9pt]" colspan="2">
                          Datum
                      </th>
                      <th class="p-1 text-right text-[9pt]">Gesamt (km)</th>
                      <th class="p-1 text-right text-[9pt]">Gefahren (km)</th>
                      <th class="p-1 text-right text-[9pt]">Anzahl Fahrten</th>
                      <th class="w-min p-1 text-right text-[9pt]">Tageskasse</th>
                  </tr>
              </thead>
              <tbody class="border-x border-neutral-100 bg-neutral-50">
                  {{#each entries}}
                      <tr class="border-b border-neutral-200">
                          <td class="w-[15px] p-1 px-2 text-left text-[8pt]">{{this.date_1}}</td>
                          <td class="w-[60px] p-1 px-2 text-left text-[8pt] border-r border-neutral-200">{{this.date_2}}</td>
                          <td class="p-1 px-2 text-right text-[8pt] border-r border-neutral-200">{{this.total_distance}}</td>
                          <td class="p-1 px-2 text-right text-[8pt] border-r border-neutral-200">{{this.driven_distance}}</td>
                          <td class="p-1 px-2 text-right text-[8pt] border-r border-neutral-200">{{this.tour_count}}</td>
                          <td class="w-[100px] p-1 px-2 text-right text-[8pt]">
                              {{this.cash}}
                          </td>
                      </tr>
                  {{/each}}
              </tbody>
          </table>
          <div class="flex w-full flex-row items-center justify-between bg-neutral-800 p-2 px-4 text-white">
              <div class="flex flex-row gap-2">
                  <span class="text-xs font-bold">Total</span>
              </div>
              <div class="flex flex-row gap-2">
                  <span class="text-xs font-bold">
                      {{formatCurrency total locale}} {{currency}}
                  </span>
              </div>
          </div>
      </div>
      <div class="flex flex-1 flex-grow w-full">
      </div>
      <div class="flex w-full flex-col border-t border-neutral-400">
        <div class="w-full">
            <div>
                <span class="text-[7pt] text-neutral-500">Print {{printnumber}}</span>
            </div>
        </div>
        <div class="w-full">
            <div class="flex flex-col w-full text-[6pt] text-justify">
                {{outro locale}}
            </div>
        </div>
      </div>
  </div>
</div>
`);
