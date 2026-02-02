import AdminLoginSection from "./AdminLoginSection";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";

export const metadata = {
  title: "Admin Login || LUXAR TRADE",
  description: "Sign in to the LUXAR TRADE admin dashboard.",
};

export default function AdminPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <main className="admin-login-wrapper"> 
        <AdminLoginSection />
      </main>
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
