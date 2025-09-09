"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { logOut, selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { Star, LogOut, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logOut());
    router.push("/login");
  };

  const navLinks = [
    // { name: "Dashboard", href: "/" },
    { name: "Selezioni", href: "/selezioni" },
    { name: "Annunci", href: "/annunci" },
    { name: "Candidature", href: "/candidature" },
    { name: "Figure Professionali", href: "/gestione/figure-professionali" },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white border-b h-[69px]">
      <div className="flex items-center gap-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          prefetch={false}
        >
          <div className="relative">
            <span className="text-3xl font-bold bg-gradient-to-b from-black to-gray-500 text-transparent bg-clip-text">
              BigSter
            </span>
            <Star className="absolute w-5 h-5 text-[#e4d72b] fill-[#e4d72b] -top-1 left-[26px]" />
          </div>
        </Link>

        {/* Mobile Menu */}
        <div className="md:hidden ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => {
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-4 py-2 text-sm font-medium ${
                        "/" + pathname.split("/")[1] ===
                        "/" + link.href.split("/")[1]
                          ? "bg-[#FEF19A] text-[#6C4E06] rounded-sm"
                          : "text-[#333333] hover:bg-gray-100 rounded-sm"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => {
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium ${
                  "/" + pathname.split("/")[1] === "/" + link.href.split("/")[1]
                    ? "bg-bigster-background text-bigster-text rounded-sm"
                    : "text-[#333333] hover:bg-gray-100 rounded-sm"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="bg-transparent">
            <Button className="flex items-center gap-2 p-0 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-medium border border-[#d4d4d4]">
                {user?.nome && user?.cognome
                  ? `${user.nome[0]}${user.cognome[0]}`
                  : "MR"}
              </div>

              <span className="hidden sm:inline text-sm font-medium text-[#333333]">
                {user?.nome && user?.cognome
                  ? `Dott. ${user.nome} ${user.cognome}`
                  : "Dott. Mario Rossi"}
              </span>
              <ChevronDown className="hidden w-4 h-4 sm:inline text-[#333333]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.nome && user?.cognome
                    ? `${user.nome} ${user.cognome}`
                    : "Mario Rossi"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "mario.rossi@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Profilo</DropdownMenuItem>
            <DropdownMenuItem disabled>Impostazioni</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
