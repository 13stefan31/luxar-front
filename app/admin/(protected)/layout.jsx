import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminProtectedLayout({ children }) {
  const token = cookies().get("admin_token")?.value;
  if (!token) {
    redirect("/admin");
  }

  return <>{children}</>;
}
