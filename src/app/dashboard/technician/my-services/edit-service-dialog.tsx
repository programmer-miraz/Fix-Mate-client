"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateService } from "@/lib/api/get-services";
import { cn } from "@/lib/utils";

import type { MyService } from "./services";

const fieldClass =
    "h-11 w-full rounded-xl border border-blue-100 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const categories = [
    "Smartphone",
    "Laptop & PC",
    "AC",
    "Refrigerator",
    "TV",
    "Washing Machine",
    "Electrical",
];

type EditFormValues = {
    title: string;
    category: string;
    description: string;
    basePrice: string;
    estimatedDuration: string;
    serviceMode: "Home Visit" | "Shop Drop-off";
    serviceArea: string;
};

// Small ImgBB response shape (same logic as the Add Service form).
type ImgBBResponse = {
    data?: { url?: string };
    error?: { message?: string };
};

async function uploadImageToImgBB(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
        throw new Error("ImgBB API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to your .env file.");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        { method: "POST", body: formData }
    );

    const result: ImgBBResponse = await response.json();

    if (!response.ok || !result.data?.url) {
        throw new Error(result.error?.message || "Image upload failed. Please try again.");
    }

    return result.data.url;
}

function getInitialValues(service: MyService): EditFormValues {
    return {
        title: service.title || "",
        category: service.category || "Smartphone",
        description: service.description || "",
        basePrice: String(service.basePrice ?? ""),
        estimatedDuration: service.estimatedDuration || "",
        serviceMode: service.serviceMode || "Home Visit",
        serviceArea: service.serviceArea || "",
    };
}

type Props = {
    service: MyService;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
};

export default function EditServiceDialog({
    service,
    open,
    onOpenChange,
    onUpdated,
}: Props) {
    const [formValues, setFormValues] = useState<EditFormValues>(() =>
        getInitialValues(service)
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(service.image || "");
    const [isSaving, setIsSaving] = useState(false);

    function handleFieldChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const fieldName = event.target.name as keyof EditFormValues;
        setFormValues((previous) => ({
            ...previous,
            [fieldName]: event.target.value,
        }));
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] || null;
        setImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImagePreview(String(reader.result));
            reader.readAsDataURL(file);
        } else {
            setImagePreview(service.image || "");
        }
    }

    function validateForm() {
        if (!formValues.title.trim()) return "Service title is required.";
        if (!formValues.description.trim()) return "Description is required.";
        if (!formValues.basePrice.trim() || Number(formValues.basePrice) <= 0) {
            return "Please enter a valid base price.";
        }
        if (!formValues.estimatedDuration.trim()) return "Estimated duration is required.";
        if (!formValues.serviceArea.trim()) return "Service area is required.";
        return "";
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSaving) return; // prevent multiple submissions

        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSaving(true);

        try {
            // Upload only when the technician chose a new image.
            let imageUrl = service.image || "";
            if (imageFile) {
                imageUrl = await uploadImageToImgBB(imageFile);
            }

            // updateService() already sets approvalStatus to "pending".
            await updateService(service._id, {
                title: formValues.title.trim(),
                category: formValues.category,
                description: formValues.description.trim(),
                basePrice: Number(formValues.basePrice),
                estimatedDuration: formValues.estimatedDuration.trim(),
                serviceMode: formValues.serviceMode,
                serviceArea: formValues.serviceArea.trim(),
                image: imageUrl,
            });

            toast.success("Service updated successfully.");
            onOpenChange(false);
            onUpdated(); // refresh the My Services list
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Could not update service. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit service</DialogTitle>
                    <DialogDescription>
                        Update the details below and save your changes.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor={`edit-title-${service._id}`}>Service Title</Label>
                        <Input
                            id={`edit-title-${service._id}`}
                            name="title"
                            value={formValues.title}
                            onChange={handleFieldChange}
                            className="mt-1.5"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label htmlFor={`edit-category-${service._id}`}>Category</Label>
                        <div className="relative mt-1.5">
                            <select
                                id={`edit-category-${service._id}`}
                                name="category"
                                value={formValues.category}
                                onChange={handleFieldChange}
                                className={`${fieldClass} appearance-none pr-10`}
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor={`edit-description-${service._id}`}>Description</Label>
                        <textarea
                            id={`edit-description-${service._id}`}
                            name="description"
                            rows={3}
                            value={formValues.description}
                            onChange={handleFieldChange}
                            className={`${fieldClass} min-h-24 resize-y py-3`}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Price */}
                        <div>
                            <Label htmlFor={`edit-price-${service._id}`}>Base Price (USD)</Label>
                            <Input
                                id={`edit-price-${service._id}`}
                                name="basePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formValues.basePrice}
                                onChange={handleFieldChange}
                                className="mt-1.5"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <Label htmlFor={`edit-duration-${service._id}`}>Estimated Duration</Label>
                            <Input
                                id={`edit-duration-${service._id}`}
                                name="estimatedDuration"
                                value={formValues.estimatedDuration}
                                onChange={handleFieldChange}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Service mode */}
                        <div>
                            <Label htmlFor={`edit-mode-${service._id}`}>Service Mode</Label>
                            <div className="relative mt-1.5">
                                <select
                                    id={`edit-mode-${service._id}`}
                                    name="serviceMode"
                                    value={formValues.serviceMode}
                                    onChange={handleFieldChange}
                                    className={`${fieldClass} appearance-none pr-10`}
                                >
                                    <option value="Home Visit">Home Visit</option>
                                    <option value="Shop Drop-off">Shop Drop-off</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        {/* Service area */}
                        <div>
                            <Label htmlFor={`edit-area-${service._id}`}>Service Area</Label>
                            <Input
                                id={`edit-area-${service._id}`}
                                name="serviceArea"
                                value={formValues.serviceArea}
                                onChange={handleFieldChange}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    {/* Image */}
                    <div>
                        <Label htmlFor={`edit-image-${service._id}`}>Service Image</Label>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                            <label
                                htmlFor={`edit-image-${service._id}`}
                                className="flex h-10 cursor-pointer items-center rounded-xl border border-blue-200 bg-white px-4 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                                Choose new image
                                <input
                                    id={`edit-image-${service._id}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="sr-only"
                                />
                            </label>

                            {imagePreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={imagePreview}
                                    alt="Service preview"
                                    className="h-14 w-20 rounded-lg border border-blue-100 object-cover"
                                />
                            ) : (
                                <span className="text-xs text-slate-400">No image</span>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-10 cursor-pointer rounded-xl border-blue-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className={cn(
                                "h-10 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
