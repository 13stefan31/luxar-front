import React from "react";
import Sidebar from "./Sidebar";

export default function Dashboard() {
  return (
    <section className="dashboard-widget" style={{ minHeight: "70vh" }}>
      <div className="right-box">
        <Sidebar />
        <div className="content-column">
          <div
            className="inner-column"
            style={{ minHeight: "60vh", padding: "32px 24px" }}
          >
            <div className="list-title" style={{ marginBottom: "12px" }}>
              <h3 className="title">Dashboard.</h3>
              <div className="text">
                
              </div>
            </div> 
          </div>
        </div>
      </div>
    </section>
  );
}
