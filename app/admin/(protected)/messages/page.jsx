import Messages from "@/components/admin/Messages";

import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Messages || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function MessagesPage() {
  return (
    <>
      <div className="admin-shell">
        <HeaderDashboard />

        <Messages />
      </div>
    </>
  );
}
