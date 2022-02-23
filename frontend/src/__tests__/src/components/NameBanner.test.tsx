import React from "react";
import renderer from "react-test-renderer";
import { NameBanner } from "../../../components/NameBanner";

it("Renders Hello World", () => {
  const tree = renderer.create(<NameBanner name={""} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it("Renders Pedrito", () => {
  const tree = renderer.create(<NameBanner name={"Pedrito"} />).toJSON();
  expect(tree).toMatchSnapshot();
});
