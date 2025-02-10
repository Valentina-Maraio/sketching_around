"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tldraw } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"

// We'll pretend that each item is just an object with a `title` string
// but you could store other data as well, e.g. { title, id, ... }

export default function Dashboard() {
  // 1) Track which Playground item is currently selected
  const [selectedPlaygroundItem, setSelectedPlaygroundItem] = useState<{
    title: string
    [key: string]: any
  } | null>(null)

  // Callback that the sidebar will call
  const handlePlaygroundItemClick = (item: any) => {
    setSelectedPlaygroundItem(item)
  }

  return (
    <SidebarProvider>
      {/* 2) Pass the callback to AppSidebar */}
      <AppSidebar onPlaygroundItemClick={handlePlaygroundItemClick} />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50">
              {/* Show something based on which item is selected */}
              {selectedPlaygroundItem ? (
                <h3>{selectedPlaygroundItem.title} (Box #1)</h3>
              ) : (
                <h3>Project n.1</h3>
              )}
            </div>
            <div className="aspect-video rounded-xl bg-muted/50">
              {selectedPlaygroundItem ? (
                <p>More about {selectedPlaygroundItem.title} (Box #2)</p>
              ) : (
                <h3>Project n.2</h3>
              )}
            </div>
            <div className="aspect-video rounded-xl bg-muted/50">
              {selectedPlaygroundItem ? (
                <p>Even more data about {selectedPlaygroundItem.title} (Box #3)</p>
              ) : (
                <h3>Project n.3</h3>
              )}
            </div>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <Tldraw />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
