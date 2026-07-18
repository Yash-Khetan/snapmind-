import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const workspaceLinks = [
  { to: "/app", icon: "⌂", label: "Home", end: true },
  { to: "/app/search", icon: "⌕", label: "Search", end: false },
  { to: "/app/explore", icon: "↗", label: "Explore", end: false },
  { to: "/app/graph", icon: "◎", label: "Graph", end: false },
];

const libraryLinks = [
  { to: "/app/explore", icon: "▣", label: "All images", end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-56 h-screen flex flex-col border-r border-border bg-surface shrink-0 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <NavLink to="/app" className="text-base font-semibold text-text-primary no-underline tracking-tight">
          SnapMind
        </NavLink>
      </div>

      {/* Workspace */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider px-2 mb-1.5">
          Workspace
        </p>
        <ul className="list-none p-0 m-0 space-y-0.5">
          {workspaceLinks.map((link) => (
            <li key={link.to + link.label}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] no-underline transition-colors ${
                    isActive
                      ? "bg-accent-light text-accent font-medium"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }`
                }
              >
                <span className="text-sm w-4 text-center">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider px-2 mt-5 mb-1.5">
          Library
        </p>
        <ul className="list-none p-0 m-0 space-y-0.5">
          {libraryLinks.map((link) => (
            <li key={link.to + link.label}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] no-underline transition-colors ${
                    isActive
                      ? "bg-accent-light text-accent font-medium"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }`
                }
              >
                <span className="text-sm w-4 text-center">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Upload shortcut */}
        <div className="mt-4 px-1">
          <NavLink
            to="/app/upload"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md text-[13px] font-medium bg-accent text-white hover:bg-accent-hover no-underline transition-colors"
          >
            + Upload
          </NavLink>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-text-primary truncate m-0">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-text-tertiary truncate m-0">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] text-text-tertiary hover:text-danger cursor-pointer bg-transparent border-none p-1"
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}
