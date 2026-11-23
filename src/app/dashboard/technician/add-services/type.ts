
export type ServiceData = {

    title: string;
    category:
    | "Smartphone"
    | "Laptop & PC"
    | "AC"
    | "Refrigerator"
    | "TV"
    | "Washing Machine"
    | "Electrical";
    description: string;
    image: string;
    basePrice: number;
    estimatedDuration: string;
    serviceMode: "Home Visit" | "Shop Drop-off";
    serviceArea: string;
    technicianId: string;
    technicianEmail: string;
    approvalStatus: "pending" | "approved" | "rejected";
    isAvailable: boolean;
    createdAt: Date;
};
