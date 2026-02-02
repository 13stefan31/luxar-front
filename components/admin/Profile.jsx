"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Image from "next/image";
import SelectComponent from "../common/SelectComponent";
export default function Profile() {
  const [images, setImages] = useState(["/images/placeholder.svg"]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDelete = (index) => {
    const newImages = images.filter((_, imgIndex) => imgIndex !== index);
    setImages(newImages);
  };
  const [images2, setImages2] = useState([
    "/images/placeholder.svg",
    "/images/placeholder.svg",
    "/images/placeholder.svg",
  ]);

  const handleImageChange2 = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images2];
        newImages[index] = reader.result;
        setImages2(newImages);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDelete2 = (index) => {
    const newImages = images2.filter((_, imgIndex) => imgIndex !== index);
    setImages2(newImages);
  };
  return (
    <section className="dashboard-widget-two">
      <div className="right-box">
        <Sidebar />
        <div className="content-column">
          <div className="inner-column">
            <div className="list-title">
              <h3 className="title">Profile</h3>
              <div className="text">
                Lorem ipsum dolor sit amet, consectetur.
              </div>
            </div>
            <div className="gallery-sec">
              <div className="right-box-three">
                <h6 className="title">Gallery</h6>
                <div className="gallery-box">
                  <div className="inner-box add-input-image">
                    {images.map((imgSrc, index) => (
                      <div className="image-box" key={index}>
                        <Image
                          width={190}
                          height={167}
                          src={imgSrc}
                          alt={`Preview ${index}`}
                          className="uploaded-img"
                        />
                        <div className="content-box">
                          <ul className="social-icon">
                            <li>
                              <a onClick={() => handleDelete(index)}>
                                <Image
                                  width={18}
                                  height={18}
                                  src="/images/placeholder.svg"
                                  alt=""
                                />
                              </a>
                            </li>
                            <li>
                              {/* Hidden input and label for upload */}
                              <label htmlFor={`file-upload-${index}`}>
                                <a>
                                  <Image
                                    width={18}
                                    height={18}
                                    src="/images/placeholder.svg"
                                    alt="Upload"
                                  />
                                </a>
                              </label>
                              <input
                                id={`file-upload-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, index)}
                                style={{ display: "none" }}
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}

                    {/* Upload Button */}
                    <div className="uplode-box">
                      <div className="content-box">
                        <label htmlFor="upload-new">
                          <Image
                            width={34}
                            height={34}
                            src="/images/placeholder.svg"
                            alt="Upload"
                          />
                          <span>Upload</span>
                        </label>
                        <input
                          id="upload-new"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageChange(e, images.length)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text">
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg &amp; .png
                  </div>
                </div>
              </div>
              <div className="form-sec">
                <form onSubmit={(e) => e.preventDefault()} className="row">
                  <div className="col-lg-4">
                    <div className="form_boxes">
                      <label>First Name</label>
                      <input
                        name="name"
                        required
                        type="text"
                        placeholder="Ali"
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form_boxes">
                      <label>Last Name</label>
                      <input
                        name="last-name"
                        required
                        type="text"
                        placeholder="Tufan"
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form_boxes">
                      <label>Email</label>
                      <input
                        required
                        name="email"
                        type="email"
                        placeholder="creativelayers088@gmail.com"
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form_boxes">
                      <label>Phone</label>
                      <input
                        name="phone"
                        required
                        type="number"
                        placeholder={+77}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form_boxes">
                      <label>Whatsapp</label>
                      <input
                        name="whatsapp"
                        required
                        type="number"
                        placeholder={+98}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="form_boxes">
                      <label>Website</label>
                      <input
                        name="website"
                        type="text"
                        required
                        placeholder="www.creativelayers.net"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="right-box-three v2">
                <h6 className="title">Photos</h6>
                <div className="gallery-box">
                  <div className="inner-box">
                    {images2.map((imgSrc, index) => (
                      <div className="image-box" key={index}>
                        <Image
                          width={190}
                          height={167}
                          src={imgSrc}
                          alt={`Preview ${index}`}
                        />
                        <div className="content-box">
                          <ul className="social-icon">
                            <li>
                              <a onClick={() => handleDelete2(index)}>
                                <Image
                                  width={18}
                                  height={18}
                                  src="/images/placeholder.svg"
                                  alt=""
                                />
                              </a>
                            </li>
                            <li>
                              {/* Hidden input and label for upload */}
                              <label htmlFor={`file-upload-${index}`}>
                                <a>
                                  <Image
                                    width={18}
                                    height={18}
                                    src="/images/placeholder.svg"
                                    alt="Upload"
                                  />
                                </a>
                              </label>
                              <input
                                id={`file-upload-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange2(e, index)}
                                style={{ display: "none" }}
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}

                    {/* Upload Button */}
                    <div className="uplode-box">
                      <div className="content-box">
                        <label htmlFor="upload-new">
                          <Image
                            width={34}
                            height={34}
                            src="/images/placeholder.svg"
                            alt="Upload"
                          />
                          <span>Upload</span>
                        </label>
                        <input
                          id="upload-new"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleImageChange2(e, images2.length)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text">
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg &amp; .png
                  </div>
                </div>
              </div>
              <div className="map-sec-two">
                <div className="form-sec-two">
                  <form onSubmit={(e) => e.preventDefault()} className="row">
                    <div className="col-lg-6">
                      <div className="form_boxes">
                        <label>Friendly Address</label>
                        <input
                          type="text"
                          name="address"
                          required
                          placeholder="ali tufan"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form_boxes">
                        <label>Map Location</label>
                        <input
                          required
                          type="text"
                          name="map-location"
                          placeholder="Map Location"
                        />
                      </div>
                    </div>
                    <div className="map-box">
                      <div className="goole-iframe">
                        <iframe src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=1%20Grafton%20Street,%20Dublin,%20Ireland+(My%20Business%20Name)&t=&z=14&ie=UTF8&iwloc=B&output=embed"></iframe>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form_boxes">
                        <label>Longitude</label>

                        <SelectComponent options={["33", "33", "33"]} />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form_boxes">
                        <label>Video Link</label>
                        <input
                          required
                          type="text"
                          name="video-link"
                          placeholder="#"
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form_boxes">
                        <label>Description</label>
                        <textarea
                          name="text"
                          placeholder="Lorem Ipsum Dolar Sit Amet"
                          defaultValue={""}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-submit">
                      <button type="submit" className="theme-btn">
                        Save Profile
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
