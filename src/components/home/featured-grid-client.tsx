"use client";

import { motion, type Variants } from "motion/react";
import { ServiceCard, type Service } from "@/components/services/service-card";

interface UserSummary {
  _id?: string;
  id?: string;
  name?: string;
  businessName?: string;
}

interface FeaturedGridClientProps {
  services: Service[];
  users?: UserSummary[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FeaturedGridClient({ services, users = [] }: FeaturedGridClientProps) {
  const vendorMap = new Map<string, string>();
  for (const u of users) {
    const id = u._id || u.id;
    if (id) vendorMap.set(id, u.businessName || u.name || "WedPlan Vendor");
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {services.map((service, index) => (
        <motion.div key={service._id} variants={itemVariants} className="h-full">
          <ServiceCard
            service={service}
            featured={index === 0}
            vendorName={vendorMap.get(service.vendorId)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
