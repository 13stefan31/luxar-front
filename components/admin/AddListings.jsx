"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { adminCreateCar } from "@/lib/adminApi";
import CarForm from "./CarForm";
import toast from "react-hot-toast";

export default function AddListings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async (payload) => {
    setLoading(true);
    setValidationErrors({});
    try {
      const created = await adminCreateCar(payload);
      setValidationErrors({});
      toast.success("Vozilo je uspješno dodato.");
      const createdId =
        created?.id ??
        created?.uuid ??
        created?.data?.id ??
        created?.data?.uuid ??
        created?.car?.id ??
        created?.car?.uuid;
      if (createdId) {
        router.push(`/admin/vozila/${createdId}`);
      }
    } catch (error) {
      if (error?.validationErrors) {
        setValidationErrors(error.validationErrors);
        toast.error("Provjeri unos");
        return;
      }
      toast.error(error?.message || "Neuspješno dodavanje vozila.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard-widget">
      <div className="right-box">
        <Sidebar />
        <div className="content-column">
          <div className="inner-column">
            <div className="list-title header-with-action">
              <div>
                <ul className="breadcrumb">
                  <li>
                    <Link href="/admin/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link href="/admin/vozila">Vozila</Link>
                  </li>
                  <li>
                    <span>Dodaj vozilo</span>
                  </li>
                </ul>
                <h2 className="title">Dodaj vozilo</h2>
              </div>
            </div>
            <CarForm
              submitLabel={loading ? "Sačuvaj..." : "Sačuvaj vozilo"}
              onSubmit={handleSubmit}
              disabled={loading}
              validationErrors={validationErrors}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
