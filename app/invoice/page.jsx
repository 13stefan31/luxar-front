import Invoice from "@/components/otherPages/Invoice";
import React from "react";

export const metadata = {
  title: "Invoice || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function InvoicePage() {
  return (
    <div className="wrapper-invoice">
      <Invoice />
    </div>
  );
}
