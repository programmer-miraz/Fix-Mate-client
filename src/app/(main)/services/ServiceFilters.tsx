"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

const selectClass =
  "h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-48";

export default function ServiceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local value for the text box. It is pushed to the URL on Search / Enter.
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const mode = searchParams.get("mode") || "";
  const sort = searchParams.get("sort") || "";

  // Keep every other parameter, then change just the one we are editing.
  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name); // reset to default
    }

    const query = params.toString();
    router.push(query ? `/services?${query}` : "/services");
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("search", searchText.trim());
  }

  function clearAll() {
    setSearchText("");
    router.push("/services");
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg shadow-blue-900/5 sm:p-5">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="service-search" className="sr-only">
            Search services
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="service-search"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by service name or category..."
            className="h-11 pl-10"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="service-category" className="sr-only">
            Category
          </label>
          <select
            id="service-category"
            value={category}
            onChange={(event) => updateParam("category", event.target.value)}
            className={selectClass}
          >
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Service mode */}
        <div>
          <label htmlFor="service-mode" className="sr-only">
            Service mode
          </label>
          <select
            id="service-mode"
            value={mode}
            onChange={(event) => updateParam("mode", event.target.value)}
            className={selectClass}
          >
            <option value="">All Service Modes</option>
            <option value="Home Visit">Home Visit</option>
            <option value="Shop Drop-off">Shop Drop-off</option>
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label htmlFor="service-sort" className="sr-only">
            Sort services
          </label>
          <select
            id="service-sort"
            value={sort}
            onChange={(event) => updateParam("sort", event.target.value)}
            className={selectClass}
          >
            <option value="">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="h-11 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
          >
            <Search className="size-4" />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            className={cn(
              "h-11 cursor-pointer rounded-xl border-blue-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-blue-50"
            )}
          >
            <SlidersHorizontal className="size-4" />
            Clear All
          </Button>
        </div>
      </form>

      {/* Quick view of what is active (helps on mobile) */}
      {(search || category || mode || sort) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-blue-50 pt-3 text-xs text-slate-500">
          <span className="font-medium">Active:</span>
          {search && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Search: {search}</span>}
          {category && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{category}</span>}
          {mode && <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">{mode}</span>}
          {sort && <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">{sort}</span>}
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-red-600 transition hover:bg-red-50"
          >
            <X className="size-3" />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
