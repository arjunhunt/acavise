import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export function Logo({ size = "md", link = true }: { size?: "md" | "lg"; link?: boolean }) {
  const img = (
    <img
      src="logo-icon.png"
      alt="AcaVise"
      className={cn("logo-ink aspect-square w-auto object-contain", size === "md" ? "h-10" : "h-14")}
    />
  );
  if (!link) return img;
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="AcaVise home">
      {img}
    </Link>
  );
}
