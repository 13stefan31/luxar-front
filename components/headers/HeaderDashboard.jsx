"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

export default function HeaderDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("/api/admin/logout", { method: "POST" });
    if (response.ok) {
      toast.success("Uspješno ste se odjavili.");
    } else {
      toast.error("Greška prilikom odjave.");
    }
    router.push("/admin");
  };

  return (
    <header className="boxcar-header header-style-ten">
      <div className="header-inner">
        <div className="inner-container">
          <div className="c-box">
            <div className="logo-inner">
              <div className="logo">
                <Image
                  alt=""
                  title="Boxcar"
                  width={108}
                  height={26}
                  src="/images/logo.svg"
                />
              </div>
            </div>
            <div className="right-box">
              <button className="header-logout" onClick={handleLogout}>
                Odjavi se
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
