import type { Companies } from "@taxikassede/core/src/entities/companies";
import type { UserSession } from "../lib/auth/util";
import { removeCompany } from "@/lib/api/companies";
import { A, useAction, useSubmission } from "@solidjs/router";
import ChevronDown from "lucide-solid/icons/chevron-down";
import Feather from "lucide-solid/icons/feather";
import ImagePlus from "lucide-solid/icons/image-plus";
import Pencil from "lucide-solid/icons/pencil";
import Plus from "lucide-solid/icons/plus";
import Trash from "lucide-solid/icons/trash";
// import SkipForward from "lucide-solid/icons/skip-forward";
import { createSignal, For, Show } from "solid-js";
import { toast } from "solid-sonner";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Company = (props: { user: UserSession["user"]; comp: Companies.Info; regionsAmount: number }) => {
  const [openDeleteModal, setOpenDeleteModal] = createSignal(false);
  const removeCompanyAction = useAction(removeCompany);
  const removeCompanyStatus = useSubmission(removeCompany);
  return (
    <div class="flex flex-col gap-0 w-full h-max rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-clip">
      <div class="flex flex-col w-full h-80 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black">
        <Show
          when={props.comp.banner !== "/images/default-company-banner.png"}
          fallback={
            <div class="w-full h-full flex flex-col items-center justify-center gap-4">
              <span class="text-sm font-medium text-muted-foreground">
                There is no banner image set for this company.
              </span>
              <div class="w-max flex flex-row items-center gap-3">
                <Button size="sm" class="flex items-center gap-2">
                  <span>Add Banner</span>
                  <ImagePlus class="size-4" />
                </Button>
                <span class="text-sm text-muted-foreground">or</span>
                <Button size="sm" class="flex items-center gap-2" variant="outline">
                  <span>Use Default</span>
                  <Feather class="size-4" />
                </Button>
              </div>
            </div>
          }
        >
          <img src={props.comp.banner} alt={`Image of ${props.comp.name}`} class="w-full h-full object-cover" />
        </Show>
      </div>
      <div class="flex flex-col p-6 gap-6 w-full">
        <div class="flex flex-row gap-4 w-full">
          <div class="flex flex-col w-max">
            <div class="size-14 flex flex-row items-center justify-center text-muted-foreground border-2 border-neutral-300 dark:border-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer">
              <Show
                when={props.comp.image !== "/images/default-company-profile.png"}
                fallback={<ImagePlus class="size-6" />}
              >
                <img src={props.comp.image} alt={`Image of ${props.comp.name}`} class="size-full object-cover" />
              </Show>
            </div>
          </div>
          <div class="flex flex-col gap-0.5 w-full">
            <div class="flex flex-row items-baseline gap-1">
              <span class="font-bold">{props.comp.name}</span>
              <span class="text-xs font-medium text-muted-foreground">by {props.comp.owner?.name}</span>
            </div>
            <div class="text-sm">{props.comp.email}</div>
            <div class="text-sm">{props.comp.phoneNumber}</div>
          </div>
          <div class="flex flex-col gap-0.5 w-max">
            <DropdownMenu>
              <DropdownMenuTrigger as={Button} size="sm" class="flex items-center gap-2">
                <span>Actions</span>
                <ChevronDown class="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  class="flex flex-row items-center gap-2"
                  as={A}
                  href={`/dashboard/companies/${props.comp.id}/edit`}
                >
                  <Pencil class="size-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <Show when={props.comp.owner?.id === props.user?.id}>
                  <DropdownMenuSeparator />
                  <Dialog open={openDeleteModal()} onOpenChange={setOpenDeleteModal}>
                    <DialogTrigger
                      as={DropdownMenuItem}
                      class="flex flex-row items-center gap-2 text-red-500 hover:!bg-red-200 dark:hover:!bg-red-800 hover:!text-red-600 dark:hover:!text-red-500"
                      closeOnSelect={false}
                    >
                      <Trash class="size-4" />
                      <span>Delete</span>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>Delete Company?</DialogHeader>
                      <DialogDescription>
                        Are you sure you want to delete this company? This action cannot be undone. All data associated
                        with this company will be deleted, including employees,vehicles, regions, and rides.
                      </DialogDescription>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setOpenDeleteModal(false);
                          }}
                        >
                          No, Cancel!
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={removeCompanyStatus.pending}
                          onClick={() => {
                            if (props.comp.id === null) return;
                            if (!props.user || !props.comp.owner) return;
                            if (props.user.id === null) return;
                            if (props.user.id !== props.comp.owner.id) {
                              toast.error("You are not the owner of this company");
                              return;
                            }
                            toast.promise(removeCompanyAction(props.comp.id), {
                              loading: "Deleting Company",
                              success: () => {
                                setOpenDeleteModal(false);
                                return "Company deleted";
                              },
                              error: "Failed to delete company",
                            });
                          }}
                        >
                          Yes, Delete.
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Show>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-6 w-full p-6 border-t border-neutral-200 dark:border-neutral-800">
        <div class="col-span-full flex flex-row gap-6 w-full items-center justify-between">
          <span class="text-base font-bold w-max">Regions</span>
          <span class="text-xs font-medium w-max text-muted-foreground border border-neutral-300 dark:border-neutral-800 rounded-md px-2 py-1 select-none">
            {props.comp.regions.length}/{props.regionsAmount}
          </span>
        </div>
        <For
          each={props.comp.regions}
          fallback={
            <div class="col-span-full p-20 w-full border border-neutral-200 dark:border-neutral-800 rounded-md items-center bg-neutral-50 dark:bg-neutral-900 justify-center flex flex-col gap-4">
              <span class="text-sm font-bold text-muted-foreground select-none">No Regions in Collection</span>
              <Button
                size="sm"
                class="flex items-center gap-2"
                onClick={() => {
                  toast.info("Coming Soon");
                }}
              >
                <span>Add Region</span>
                <Plus class="size-4" />
              </Button>
            </div>
          }
        >
          {(r) => (
            <div class="flex flex-col gap-1 w-full h-max border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
              <div class="text-sm font-bold">{r.region.name}</div>
            </div>
          )}
        </For>
        <Show when={props.comp.regions.length > 0}>
          <div
            class="w-full p-4"
            onClick={() => {
              toast.info("Coming Soon");
            }}
          >
            <span>Add Region</span>
            <Plus class="size-4" />
          </div>
        </Show>
      </div>
      <div class="grid grid-cols-3 gap-6 w-full p-6 border-t border-neutral-200 dark:border-neutral-800">
        <span class="text-base font-bold">Employees</span>
        <For
          each={props.comp.employees}
          fallback={
            <div class="col-span-full p-20 w-full border border-neutral-200 dark:border-neutral-800 rounded-md items-center bg-neutral-50 dark:bg-neutral-900 justify-center flex flex-col gap-4">
              <span class="text-sm font-bold text-muted-foreground select-none">No Employees</span>
              <Button
                size="sm"
                class="flex items-center gap-2"
                onClick={() => {
                  toast.info("Coming Soon");
                }}
              >
                <span>Add Employee</span>
                <Plus class="size-4" />
              </Button>
            </div>
          }
        >
          {(employee) => (
            <div class="flex flex-col gap-1 w-full h-max border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
              <div class="text-sm font-bold">
                {employee.user.name} ({employee.user.email})
              </div>
            </div>
          )}
        </For>
        <Show when={props.comp.employees.length > 0}>
          <div
            class="w-full p-4"
            onClick={() => {
              toast.info("Coming Soon");
            }}
          >
            <span>Add Employee</span>
            <Plus class="size-4" />
          </div>
        </Show>
      </div>
    </div>
  );
};
