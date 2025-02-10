"use client"

import { useState, useEffect } from "react"

// Sidebar stuff
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Tldraw + Editor for v3.x
import { Tldraw, type Editor } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"

// Snapshot helpers from @tldraw/store

// tRPC client
import { trpc } from "@/utils/trpc"

export default function Dashboard() {
  // Example: single doc "project1".  
  // If you have multiple, pass the ID from your sidebar item, etc.
  const PROJECT_ID = "project1"

  // Track which Playground item is selected (from the sidebar)
  const [selectedPlaygroundItem, setSelectedPlaygroundItem] = useState<any>(null)

  // Tldraw Editor instance (we get this from onMount)
  const [editor, setEditor] = useState<Editor | null>(null)

  // 1) tRPC query to load doc data from the server
  const { data, isLoading, isError, refetch } = trpc.document.getDoc.useQuery({
    id: PROJECT_ID,
  })

  // 2) tRPC mutation to save doc data
  //    The mutation status can be "idle" | "pending" | "success" | "error"
  const {
    mutate: saveDoc,
    status,  // we'll check for 'pending' to see if it's "loading"
    error: saveError,
  } = trpc.document.saveDoc.useMutation({
    onSuccess: () => {
      // Optionally refetch or show a success message
      refetch()
    },
  })
  const isSaving = status === "pending"

  // Sidebar callback
  const handlePlaygroundItemClick = (item: any) => {
    setSelectedPlaygroundItem(item)
    // If you want to fetch a doc for that item: refetch({ id: item.id })
  }

  // 3) Tldraw onMount → the `Editor` instance in v3.x
  const handleEditorMount = (mountedEditor: Editor) => {
    setEditor(mountedEditor)
  }

// 4) When tRPC doc data arrives, apply it to the store
useEffect(() => {
  if (!editor || data === undefined) return;

  // If "data" is null, there's no existing doc → do nothing
  // Otherwise, data is your saved snapshot
  if (data) {
    // Use editor.store.put to apply data
    editor.store.put(data);
  }
}, [editor, data]);

// 5) Save current shapes to the server
const handleSave = () => {
  if (!editor) return;

  // Grab entire current state as JSON
  const snapshot = editor.store.query.records("shape").get();

  // Send to server
  saveDoc({
    id: PROJECT_ID,
    data: snapshot,
  });
};

  // Optional: handle loading/error states
  if (isLoading) {
    return <p>Loading doc from server...</p>
  }
  if (isError) {
    return <p>Error loading doc. Check logs!</p>
  }

  return (
    <SidebarProvider>
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
          {/* A few placeholders based on the selected side item */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50">
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

          {/* Tldraw Canvas */}
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden">
            <Tldraw onMount={handleEditorMount} />
          </div>

          {/* Debug: Show the loaded data */}
          <pre className="bg-gray-100 text-xs p-2 rounded max-h-60 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          {saveError && (
            <p className="text-red-500">
              Error saving doc: {saveError.message}
            </p>
          )}

          {/* Button to save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isSaving ? "Saving..." : "Save tldraw Doc"}
          </button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
