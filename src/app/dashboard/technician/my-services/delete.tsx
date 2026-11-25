"use client"
import { Trash2, Trash2Icon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Props } from "./edit-delete"
import { deleteService } from "@/lib/mutions-api/services"

export function AlertDialogDestructive({ service, onServiceUpdated }:Props) {
    const router = useRouter()
    const handleDelete = async () => {
        try {
            await deleteService(service._id);
            toast.success("Service deleted successfully!");
            onServiceUpdated()
            router.refresh();
            
        } catch (error) {
            toast.error("Failed to delete service!");
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger
                render={<Button
                    type="button"
                    variant="ghost"
                    className="h-8 cursor-pointer rounded-lg px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                    <Trash2 className="size-3.5" />
                    Delete
                </Button>}
            />
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete this service?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to permanently delete this repair service? This action cannot be undone, and customers will no longer be able to view or book this service.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline"  className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive"className="cursor-pointer" onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
