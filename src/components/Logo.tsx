import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export function Logo({ size = "md", link = true }: { size?: "md" | "lg"; link?: boolean }) {
  const img = (
    <img
      src="logo.png"
      alt="AcaVise"
      className={cn("w-auto rounded-[10px]", size === "md" ? "h-10" : "h-14 rounded-xl")}
    />
  );
  if (!link) return img;
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="AcaVise home">
      {img}
    </Link>
  );
}
