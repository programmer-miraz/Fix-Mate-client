"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Upload, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { createService } from "@/lib/mutions-api/services";

import type { ServiceData } from "./type";
import { toast } from "sonner";

// Shared style so every field looks the same.
const fieldClass =
  "h-11 w-full rounded-xl border border-blue-100 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const categories: ServiceData["category"][] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

type FormValues = {
  title: string;
  category: ServiceData["category"];
  description: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: ServiceData["serviceMode"];
  serviceArea: string;
};

const emptyForm: FormValues = {
  title: "",
  category: "Smartphone",
  description: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
};

// Small ImgBB response shape (we only need the URL).
type ImgBBResponse = {
  data?: { url?: string };
  error?: { message?: string };
};

// Uploads the chosen file to ImgBB and returns the public image URL.
async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ImgBB API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to your .env file."
    );
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

export default function AddServiceForm() {
  const { data: session } = useSession();

  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleFieldChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const fieldName = event.target.name as keyof FormValues;
    const fieldValue = event.target.value;

    setFormValues((previous) => ({ ...previous, [fieldName]: fieldValue }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview("");

    if (file) {
      // FileReader gives us a preview without uploading anything yet.
      const reader = new FileReader();
      reader.onload = () => setImagePreview(String(reader.result));
      reader.readAsDataURL(file);
    }
  }

  function validateForm() {
    if (!formValues.title.trim()) return "Service title is required.";
    if (!formValues.description.trim()) return "Description is required.";
    if (!imageFile) return "Please choose a service image.";

    const price = Number(formValues.basePrice);
    if (!formValues.basePrice.trim() || !Number.isFinite(price) || price <= 0) {
      return "Please enter a valid base price.";
    }

    if (!formValues.estimatedDuration.trim()) return "Estimated duration is required.";
    if (!formValues.serviceArea.trim()) return "Service area is required.";

    return "";
  }

  function resetForm() {
    setFormValues(emptyForm);
    setImageFile(null);
    setImagePreview("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 1. stop the normal page reload

    if (isSubmitting || isUploading) return; // prevent double submit

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm(); // 2. check required fields
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    const technicianName = session?.user?.name
    const technicianId = session?.user?.id;
    const technicianEmail = session?.user?.email;

    if (!technicianId || !technicianEmail|| !technicianName) {
      setErrorMessage("Your session is not ready. Please refresh the page and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. upload the image first so we have a URL to save
      setIsUploading(true);
      let imageUrl = "";

      if (imageFile) {
        imageUrl = await uploadImageToImgBB(imageFile);
      }
      setIsUploading(false);

      // 4. build the service data from the form values + session
      const serviceData: ServiceData = {
        title: formValues.title.trim(),
        category: formValues.category,
        description: formValues.description.trim(),
        image: imageUrl,
        basePrice: Number(formValues.basePrice),
        estimatedDuration: formValues.estimatedDuration.trim(),
        serviceMode: formValues.serviceMode,
        serviceArea: formValues.serviceArea.trim(),
        technicianId,
        technicianName,
        technicianEmail,
        approvalStatus: "pending",
        isAvailable: true,
        createdAt: new Date(),
      };

      // 5. save it through the existing API function
      await createService(serviceData);

      setSuccessMessage("Service submitted successfully. It is now pending approval.");
      toast.success("Service submitted successfully!");
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          <Wrench className="size-3.5" />
          Technician
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Add a new service
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Fill in the details below. Your service will be reviewed before it goes live.
        </p>
      </div>

      <Card className="rounded-2xl border-blue-100 shadow-xl shadow-blue-900/5">
        <CardHeader>
          <CardTitle className="text-xl">Service details</CardTitle>
          <CardDescription>
            Fields marked with * are required. Your name and email are taken from your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Technician info from session (read only) */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Posted by</p>
              <p>{session?.user?.name || "Loading your profile..."}</p>
              <p className="text-slate-500">{session?.user?.email}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Title */}
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formValues.title}
                  onChange={handleFieldChange}
                  placeholder="e.g. iPhone Screen Replacement"
                  className="mt-1.5"
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <div className="relative mt-1.5">
                  <select
                    id="category"
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
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleFieldChange}
                rows={4}
                placeholder="Describe what this service includes..."
                className={`${fieldClass} min-h-28 resize-y py-3`}
              />
            </div>

            {/* Image upload + preview */}
            <div>
              <Label htmlFor="service-image">Service Image *</Label>
              <div className="mt-1.5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <label
                  htmlFor="service-image"
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  <Upload className="size-4" />
                  Choose image
                  <input
                    id="service-image"
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
                    alt="Selected service preview"
                    className="h-20 w-28 rounded-xl border border-blue-100 object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">
                    No image selected yet
                  </span>
                )}

                {isUploading && (
                  <span className="flex items-center gap-2 text-xs text-blue-600">
                    <Loader2 className="size-4 animate-spin" />
                    Uploading image...
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Base price */}
              <div>
                <Label htmlFor="basePrice">Base Price (USD) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formValues.basePrice}
                  onChange={handleFieldChange}
                  placeholder="e.g. 50"
                  className="mt-1.5"
                />
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="estimatedDuration">Estimated Duration *</Label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  value={formValues.estimatedDuration}
                  onChange={handleFieldChange}
                  placeholder="e.g. 2-3 hours"
                  className="mt-1.5"
                />
              </div>

              {/* Service mode */}
              <div>
                <Label htmlFor="serviceMode">Service Mode *</Label>
                <div className="relative mt-1.5">
                  <select
                    id="serviceMode"
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
                <Label htmlFor="serviceArea">Service Area *</Label>
                <Input
                  id="serviceArea"
                  name="serviceArea"
                  value={formValues.serviceArea}
                  onChange={handleFieldChange}
                  placeholder="e.g. Dhanmondi, Dhaka"
                  className="mt-1.5"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="h-11 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-cyan-600 sm:w-auto sm:px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Add Service"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
