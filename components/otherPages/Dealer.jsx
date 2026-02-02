import React from "react";
import Link from "@/components/common/LocalizedLink";

export default function Dealer() {
  return (
    <section className="layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title-three">
          <h2>Dealers</h2>
          <p className="text">Lista dilera je u pripremi.</p>
          <div className="mt-3">
            <Link href="/dealer-single/1">Otvori primer dilera</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

