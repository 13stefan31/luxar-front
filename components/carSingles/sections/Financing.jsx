"use client";
import SelectComponent from "@/components/common/SelectComponent";
import Image from "next/image";
import React from "react";

export default function Financing() {
  return (
    <>
      {" "}
      <h4 className="title">Financing Calculator</h4>
      <form onSubmit={(e) => e.preventDefault()} className="row">
        <div className="col-lg-6">
          <div className="form_boxes">
            <label>Vehicle Price ($)</label>

            <SelectComponent options={["$25.000", "$25.000", "$25.000"]} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="form_boxes">
            <label>Interest rate (%)</label>

            <SelectComponent options={["4", "4", "4"]} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="form_boxes">
            <label>Period (month)</label>

            <SelectComponent options={["36", "36", "36"]} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="form_boxes">
            <label>Down Payment ($)</label>

            <SelectComponent options={["4000", "4000", "4000"]} />
          </div>
        </div>
        <div className="col-lg-12">
          <div className="form-submit">
            <button type="submit" className="theme-btn">
              Calculate
              <Image alt="" src="/images/arrow.svg" width={14} height={14} />
            </button>
          </div>
        </div>
      </form>
      <ul className="form-list">
        <li>
          <span>Monthly Payment</span>$687.70
        </li>
        <li>
          <span>Total Amount to Pay</span>$687.70
        </li>
        <li>
          <span>Total Interest Payment</span>$687.70
        </li>
      </ul>
    </>
  );
}
