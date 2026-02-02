import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Login from "@/components/otherPages/Login";

import React from "react";

export const metadata = {
  title: "Login || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function LoginPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Login />

      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
