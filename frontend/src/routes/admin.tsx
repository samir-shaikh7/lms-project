import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminRoot,
});

function AdminRoot() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const isAdmin = localStorage.getItem("is_admin") === "true";

    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    if (!isAdmin) {
      toast.error("Access denied. Administrator privileges required.");
      navigate({ to: "/" });
      return;
    }
  }, [navigate]);

  if (typeof window !== "undefined") {
     const token = localStorage.getItem("auth_token");
     const isAdmin = localStorage.getItem("is_admin") === "true";
     if (!token || !isAdmin) return null;
  }

  return <Outlet />;
}
