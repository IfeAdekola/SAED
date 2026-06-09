import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import ManageApplications from "./ManageApplications.jsx";
import { api } from "../lib/api.js";

jest.mock("../lib/api.js", () => ({ api: jest.fn() }));

async function renderPage(component) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<MemoryRouter>{component}</MemoryRouter>);
  });
  return { container, root };
}

function buttonByText(container, text) {
  return [...container.querySelectorAll("button")].find((button) => button.textContent.match(text));
}

test("trainer can approve an application", async () => {
  api.mockImplementation((path, options) => {
    if (path === "/manage/applications/" && !options) {
      return Promise.resolve({
        applications: [
          {
            id: 1,
            status: "pending",
            applicant: { fullName: "Jane Doe", email: "jane@example.com" },
            program: { title: "ICT Skills", location: "Lagos" },
          },
        ],
      });
    }
    if (path === "/manage/applications/1/" && options?.method === "PATCH") {
      return Promise.resolve({ application: { id: 1, status: "approved" } });
    }
    return Promise.resolve({ applications: [] });
  });

  const { container } = await renderPage(<ManageApplications />);

  expect(container.textContent).toContain("Jane Doe");
  await act(async () => {
    const row = [...container.querySelectorAll(".management-row")].find((r) => r.textContent.includes("Jane Doe"));
    const approveBtn = [...row.querySelectorAll("button")].find((b) => /approve/i.test(b.textContent));
    approveBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(api).toHaveBeenCalledWith("/manage/applications/1/", expect.objectContaining({ method: "PATCH" }));
});
