import { type AnchorHTMLAttributes, type PropsWithChildren } from "react";
import { GoTrophy } from "react-icons/go";
import { MdLogout, MdOutlineDashboard } from "react-icons/md";
import { TbWorld } from "react-icons/tb";
import { Categories } from "../components/Categories";
import { FiUsers } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";

import logo from "@/assets/images/cashbox-logo.webp";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <div className="flex flex-col items-center h-full p-4 overflow-y-auto gap-2 border-slate-200 border-r min-w-[235px]">
        <img src={logo} alt="" />
        <hr className="w-full border-b border-neutral-500/10" />
        <Navigations />
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default MainLayout;

function Navigations() {
  const hash = window.location.hash; // e.g., "#/prize-draw-management"
  // 1. Get everything after the last "/"
  const lastSegmentWithQuery = hash.substring(hash.lastIndexOf("/") + 1).trim();

  // 2. Split by "?" and take the first part
  const lastSegment = lastSegmentWithQuery.split("?")[0];

  console.log(lastSegment);

  return (
    <nav className="flex flex-col  gap-2 overflow-y-auto justify-between flex-1 select-none">
      <div className="flex flex-col gap-2">
        <NavLink href="#/dashboard" name="Dashboard">
          <MdOutlineDashboard size={24} />
        </NavLink>
        <NavLink name="Website Management">
          <TbWorld size={24} />
        </NavLink>
        <NavLink href="#" name="Prize Draw Management">
          <GoTrophy size={24} />
        </NavLink>
        {lastSegment.trim() === "" && <Categories />}
        <NavLink name="Users">
          <FiUsers size={24} />
        </NavLink>
        <NavLink name="Settings">
          <IoSettingsOutline size={24} />
        </NavLink>
      </div>
      <div>
        <NavLink name="Logout" href="/logout">
          <MdLogout className="text-red-500" />
        </NavLink>
      </div>
    </nav>
  );
}

function NavLink({
  children,
  name,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { name: string }) {
  function slugify(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, "-");
  }

  const hash = window.location.hash; // e.g., "#/prize-draw-management"
  // 1. Get everything after the last "/"
  const lastSegmentWithQuery = hash.substring(hash.lastIndexOf("/") + 1).trim();

  // 2. Split by "?" and take the first part
  const lastSegment = lastSegmentWithQuery.split("?")[0];

  const isSelected =
    slugify(name) === lastSegment ||
    (slugify(name) === "prize-draw-management" && lastSegment === "");

  return (
    <a
      className={`flex gap-3 items-center cursor-pointer rounded-lg px-4 py-3 text-neutral-500/50! ease-in duration-200  
        ${!isSelected ? "hover:bg-orange-100 hover:text-orange-400! " : "text-orange-400! "} `}
      {...props}
    >
      {children}
      <span className={name === "Logout" ? "text-red-500" : ""}>{name}</span>
    </a>
  );
}
