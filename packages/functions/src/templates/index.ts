import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Logo } from "./logo";
import { Style } from "./style";
import { DayEntrySelect } from "@taxi-kassede/core/drizzle/sql/schema";
import { User } from "@taxi-kassede/core/entities/users";
dayjs.extend(advancedFormat);

export * as Template from "./index";

const Base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer>console.log("Hello from the template");</script>
  </head>
  <body>
    <div class="flex flex-col w-full p-[20px]">
      ${content}
    </div>
  </body>
</html>`;

export const Simple = (
  reportnumber: string,
  user: NonNullable<User.Frontend>,
  company: NonNullable<NonNullable<User.Frontend>["company"]>,
  entries: DayEntrySelect[],
  printnumber: number,
  dayOfGeneration: Date = new Date()
) =>
  Base(`<div class="flex w-full flex-col gap-[20px] p-[20px] pl-[80px]">
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
          <h2 class="text-xs font-bold"></h2>
          <h2 class="text-xs font-bold">${company.name} - ${user.name}</h2>
          <h2 class="text-xs font-bold">SOME CONTACT</h2>
          <h2 class="text-xs font-bold">BLABLA</h2>
        </div>
        <div class="flex flex-col">
          <h2 class="text-xs font-bold">${dayjs(dayOfGeneration).format("Do MMMM YYYY")}</h2>
        </div>
      </div>
      <div class="flex h-fit w-fit flex-col gap-[5px] bg-neutral-100 p-[10px]">
        <span class="text-xs">Report-Nr.: ${reportnumber}</span>
        <span class="text-xs">Year:</span>
        <span class="text-xs">Month:</span>
      </div>
    </div>
    <div class="flex flex-col w-full">
    <table class="w-full table-auto">
      <thead class="bg-neutral-700 text-white">
        <tr class="">
          <th class="w-min p-1 px-4 text-left text-xs" colspan="2">Datum</th>
          <th class="p-1 text-left text-xs">Gesamt (km)</th>
          <th class="p-1 text-left text-xs">Gefahren (km)</th>
          <th class="p-1 text-left text-xs">Anzahl Fahrten</th>
          <th class="w-min p-1 px-4 text-left text-xs">Tageskasse</th>
        </tr>
      </thead>
      <tbody class="border-x border-neutral-100 bg-neutral-50">
        ${entries
          .map(
            (e) => `
          <tr class="border-b border-neutral-200">
          <td class="w-[20px] p-0.5 px-2 text-left text-xs">${dayjs(e.date).format("ddd")}</td>
          <td class="w-[70px] p-0.5 px-2 text-left text-xs border-r border-neutral-200">${dayjs(e.date).format(
            "Do MMM"
          )}</td>
          <td class="p-0.5 px-2 text-left text-xs border-r border-neutral-200">${e.total_distance}</td>
          <td class="p-0.5 px-2 text-left text-xs border-r border-neutral-200">${e.driven_distance}</td>
          <td class="p-0.5 px-2 text-left text-xs border-r border-neutral-200">${e.tour_count}</td>
          <td class="w-[100px] p-0.5 px-2 text-right text-xs">${new Intl.NumberFormat(
            user.profile.locale ?? "de-CH"
          ).format(e.cash)} CHF</td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    <div class="flex w-full flex-row items-center justify-between bg-neutral-800 p-2 px-4 text-white">
      <div class="flex flex-row gap-2">
        <span class="text-xs font-bold">Total</span>
      </div>
      <div class="flex flex-row gap-2">
        <span class="text-xs font-bold">${new Intl.NumberFormat(user.profile.locale ?? "de-CH").format(
          entries.reduce((acc, cur) => acc + cur.cash, 0)
        )} CHF</span>
      </div>
    </div>
    </div>
    <div class="flex w-full flex-col border-t border-neutral-400">
      <div class="w-full">
        <div>
          <span class="text-[8pt] text-neutral-500">Print #${printnumber}</span>
        </div>
      </div>
      <div class="w-full"></div>
    </div>
  </div>
</div>
`);
