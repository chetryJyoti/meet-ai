"use client";
import { useEffect, useState } from "react";
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import DashboardCommand from "./dashboard-command";

export const DashbaordNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
      <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-background">
        <Button
          className="size-9 cursor-pointer"
          variant="outline"
          onClick={toggleSidebar}
        >
          {state === "collapsed" || isMobile ? (
            <PanelLeftIcon />
          ) : (
            <PanelLeftCloseIcon />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCommandOpen((open) => !open)}
          className="h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground"
        >
          <SearchIcon />
          Search
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-sm font-medium text-muted-foreground">
            <span>&#8984;</span>K
          </kbd>
        </Button>
      </nav>
    </>
  );
};
