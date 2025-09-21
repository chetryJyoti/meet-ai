"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle
} from "@/components/ui/resizable-navbar";
import { authClient } from "@/lib/auth-client";

export const HomeNavbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "About", link: "#about" },
  ];

  return (
    <Navbar className="top-0">
      <NavBody className="py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Meet AI Logo" width={32} height={32} />
          <span className="text-xl font-semibold text-foreground">Meet AI</span>
        </div>

        {/* Navigation Items */}
        <NavItems items={navItems} />

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 relative z-20">
          {!isPending && session?.user ? (
            <Button asChild>
              <Link href="/meetings">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav className="py-4">
        <MobileNavHeader>
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Meet AI Logo" width={32} height={32} />
            <span className="text-xl font-semibold text-foreground">Meet AI</span>
          </div>
          <MobileNavToggle
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-4">
            {!isPending && session?.user ? (
              <Button className="w-full" asChild>
                <Link href="/meetings">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};