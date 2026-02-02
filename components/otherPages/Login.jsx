"use client";
import React, { useState } from "react";
import Image from "next/image";

const initialCredentials = { username: "", password: "" };

export default function Login({ onSignIn, isLoading = false }) {
  const [credentials, setCredentials] = useState(initialCredentials);

  const handleChange = (field) => (event) => {
    setCredentials((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleSignInSubmit = (event) => {
    event.preventDefault();
    onSignIn?.(credentials);
  };
  return (
    <section className="login-section layout-radius">
      <div className="inner-container">
        <div className="right-box">
          <div className="form-sec">
            <nav>
              <div className="nav nav-tabs" id="nav-tab" role="tablist">
                <button
                  className="nav-link active"
                  id="nav-home-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-home"
                  type="button"
                  role="tab"
                  aria-controls="nav-home"
                  aria-selected="true"
                >
                  Prijavi se
                </button> 
              </div>
            </nav>
            <div className="tab-content" id="nav-tabContent">
              <div
                className="tab-pane fade show active"
                id="nav-home"
                role="tabpanel"
                aria-labelledby="nav-home-tab"
              >
                <div className="form-box">
                  <form onSubmit={handleSignInSubmit}>
                    <div className="form_boxes">
                      <label>Korisničko ime</label>
                      <input
                        required
                        type="text"
                        name="name"
                        placeholder="Korisničko ime"
                        value={credentials.username}
                        onChange={handleChange("username")}
                      />
                    </div>
                    <div className="form_boxes">
                      <label>Lozinka</label>
                      <input
                        required
                        type="password"
                        name="password"
                        placeholder="Lozinka"
                        value={credentials.password}
                        onChange={handleChange("password")}
                      />
                    </div> 
                    <div className="form-submit">
                      <button
                        type="submit"
                        className="theme-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? "Učitavanje..." : "Prijavi se"}{" "}
                        <Image
                          alt=""
                          src="/images/arrow.svg"
                          width={14}
                          height={14}
                        />
                      </button>
                    </div>
                  </form> 
                </div>
              </div> 
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
