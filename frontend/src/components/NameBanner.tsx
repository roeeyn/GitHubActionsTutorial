import React from "react";
import "./NameBanner.css";

interface NameBannerProps {
  name?: string;
}

export const NameBanner = ({ name = "World" }: NameBannerProps) => {
  return (
    <section className="wrapper">
      <p className="banner">Hello {name !== "" ? name : "World"}!</p>
    </section>
  );
};
