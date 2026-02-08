"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { adminLogout } from "@/lib/adminApi";

export default function HeaderDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    const success = await adminLogout();
    if (success) {
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
                  title="Luxar rent a car"
                  width={108}
                  height={26}
                  src="/images/logo.png"
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
