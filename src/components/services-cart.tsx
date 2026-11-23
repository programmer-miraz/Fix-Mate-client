import { Suspense } from "react";

import FeaturedServices from "@/components/home/FeaturedServices";
import FeaturedServicesSkeleton from "@/components/home/FeaturedServicesSkeleton";

// Keeps the original component name used by the home page.
const Services_cart = () => {
  return (
    <Suspense fallback={<FeaturedServicesSkeleton />}>
      <FeaturedServices />
    </Suspense>
  );
};

export default Services_cart;
