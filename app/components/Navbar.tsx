"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  HandHeart,
  Icon,
  ListTree,
  Menu,
  PackagePlus,
  Receipt,
  ShoppingBasket,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { checkAndAddAssociation } from "../actions";
import Stock from "./Stock";

const Navbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();
  const navLinks = [
    { href: "/products", label: "Produits", icon: ShoppingBasket },
    { href: "/new-product", label: "Nouveau produit", icon: PackagePlus },
    { href: "/category", label: "Categories", icon: ListTree },
    { href: "/give", label: "Donner", icon: HandHeart },
    { href: "/transactions", label: "Transactions", icon: Receipt },
  ];
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
      <button
        className="btn btn-sm"
        onClick={() =>
          (
            document.getElementById("my_modal_stock") as HTMLDialogElement
          ).showModal()
        }
      >
        <Warehouse className="w-4 h-4" />
        Alimenter Stock
      </button>
    </>
  );
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user?.fullName) {
      checkAndAddAssociation(
        user?.primaryEmailAddress?.emailAddress,
        user?.fullName
      );
    }
  }, [user]);
  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2">
            <PackagePlus className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl">AssoStock</span>
        </div>

        <button
          className="btn btn-sm w-fit sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden space-x-2 sm:flex items-center">
          {renderLinks("btn")}
          <UserButton />
        </div>
      </div>

      <div
        className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50 ${
          menuOpen ? "left-0" : "-left-full"
        }`}
      >
        <div className="flex justify-between">
          <UserButton />
          <button
            className="btn btn-sm w-fit sm:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {renderLinks("btn")}
      </div>
      <Stock />
    </div>
  );
};
export default Navbar;
