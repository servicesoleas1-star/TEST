import React, { useState } from "react";
import { getOrganizerSessionEmail } from "../lib/session.js";

export default function SupportWidget() {
  const email = getOrganizerSessionEmail();
  const [open, setOpen] = useState(false);

  if (!email) return null;

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("button", {
      onClick: () => setOpen(!open),
      style: {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 40,
        width: "56px",
        height: "56px",
        borderRadius: "9999px",
        backgroundColor: "#E8651A",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "24px",
      },
      children: open ? "✕" : "💬",
    }),
    open &&
      React.createElement("div", {
        style: {
          position: "fixed",
          bottom: "96px",
          right: "24px",
          zIndex: 40,
          width: "300px",
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #E4E2DC",
          padding: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        },
        children: React.createElement("p", null, "Widget support"),
      })
  );
}