import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SizeSection } from "~/components/sizes/SizeSection";
// import { createProductOptions } from "./createProductOptions";

test("renders loader data", async () => {
  
    const RemixStub = createRemixStub([
      {
        path: "/",
        Component: SizeSection,
        loader() {
          return json({ message: "hello" });
        },
      },
    ]);
  
    render(<RemixStub />);
  
    await waitFor(() => screen.findByText("Message: hello"));
  });