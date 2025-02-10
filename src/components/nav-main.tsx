"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  onPlaygroundItemClick, // <-- NEW
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  // Our new prop is optional
  onPlaygroundItemClick?: (item: any) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {/* Top-level menu button (e.g. "Playground") */}
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={(e) => {
                    // If you specifically only want to handle "Playground" or certain items, you can do:
                    // if (item.title === "Playground") {
                    //   onPlaygroundItemClick?.(item)
                    // }
                    // Or simply call for all top-level items:
                    onPlaygroundItemClick?.(item)
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {/* Sub-items */}
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      {/* We can either use a link OR simply a button. 
                          If you want to navigate, keep <a>. 
                          If you want to purely show data, remove the href. */}
                      <SidebarMenuSubButton
                        asChild
                        onClick={() => {
                          // Call parent callback with the subItem data
                          onPlaygroundItemClick?.(subItem)
                        }}
                      >
                        {/* 
                          If you want to prevent navigation, remove `href` 
                          or do `onClick={(e) => e.preventDefault() ...}`
                        */}
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
