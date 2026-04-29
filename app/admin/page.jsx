import AdminLoginSection from "./AdminLoginSection";
import Header1 from "@/components/headers/Header1";

export const metadata = {
  robots: { index: false, follow: false },
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
    </>
  );
}
