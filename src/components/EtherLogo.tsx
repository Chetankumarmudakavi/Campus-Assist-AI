import { Link } from "react-router-dom";

export function EtherLogo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <span className="relative size-3">
        <span className="absolute inset-0 rounded-full bg-foreground" />
        <span className="absolute inset-0 rounded-full bg-primary blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
      </span>
      <span className="font-heading font-bold text-lg tracking-tighter">ETHER</span>
    </Link>
  );
}
