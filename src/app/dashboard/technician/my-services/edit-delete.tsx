"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import EditServiceDialog from "./edit-service-dialog";

import type { MyService } from "./services";
import { AlertDialogDestructive } from "./delete";


export type Props = {
    service: MyService;
    onServiceUpdated: () => void;
};

// Edit / Delete buttons. Delete stays UI-only; Edit opens the dialog.
const ActionButtons = ({ service, onServiceUpdated }: Props) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [dialogKey, setDialogKey] = useState(0);

    function openEditDialog() {
        // Remount the dialog so its form starts from the latest service data.
        setDialogKey((current) => current + 1);
        setIsEditOpen(true);
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={openEditDialog}
                    className="h-8 cursor-pointer rounded-lg border-blue-200 bg-blue-50/60 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                    <Pencil className="size-3.5" />
                    Edit
                </Button>
              {/* Delete */}
              <AlertDialogDestructive onServiceUpdated={onServiceUpdated}  service={service}/>
            </div>

            <EditServiceDialog
                key={dialogKey}
                service={service}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onUpdated={onServiceUpdated}
            />
        </>
    );
};

export default ActionButtons;
