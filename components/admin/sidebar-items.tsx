"use client";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import type { JSX } from "react";

export const SidebarItems = ({
  item,
}: {
  item: {
    title: string;
    url: string;
    icon: JSX.Element;
  };
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link href={item.url}>
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
