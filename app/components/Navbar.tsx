import { Icon, ListTree, PackagePlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Navbar = () => {
  const pathname = usePathname();
  const navLinks = [{ href: "/category", label: "Categories", icon: ListTree }];
  const renderLinks = (baseClass: string) => (
    <>
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        const activeClass = isActive ? "btn-primary" : "btn-ghost";
        return (
          <Link
            href={href}
            key={href}
            className={`${baseClass} btn-sm flex gap-2 items-center ${activeClass}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2">
            <PackagePlus className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl">AssoStock</span>
        </div>
        <div className="space-x-2 sm:flex items-center">
          {renderLinks("btn")}
        </div>
      </div>
    </div>
  );
};
export default Navbar;
