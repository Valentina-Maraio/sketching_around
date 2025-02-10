"use client"

import { useState, useEffect, MouseEvent } from "react"

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


// tRPC (same as before)
import { trpc } from "@/utils/trpc"

interface AvatarInfo {
  name: string,
  initials: string,
  color: string,
}

export default function Dashboard() {
  const PROJECT_ID = "project1"

  const { data, isLoading, isError, refetch } = trpc.document.getDoc.useQuery({
    id: PROJECT_ID,
  })
  const {
    mutate: saveDoc,
    status,
    error: saveError,
  } = trpc.document.saveDoc.useMutation({
    onSuccess: () => refetch(),
  })
  const isSaving = status === "pending"

  // Store the Tldraw editor
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 })


 // For demonstration, define three avatars
 const avatars: AvatarInfo[] = [
  { name: "Alice", initials: "AL", color: "#e11d48" }, // red
  { name: "Bob", initials: "BO", color: "#3b82f6" },   // blue
  { name: "Cara", initials: "CA", color: "#10b981" }, // green
]
// Current active user
const [currentUser, setCurrentUser] = useState<AvatarInfo>(avatars[0])

  // Called when Tldraw mounts
  const handleEditorMount = (mountedEditor: Editor) => {
    setEditor(mountedEditor)
  }

  // If we have doc data, load it
  useEffect(() => {
    if (!editor || data === undefined) return
    if (data) {
      editor.store.put(data) // merges saved shapes (including text)
    }
  }, [editor, data])

  // Whenever currentUser changes, update the default shape style
  useEffect(() => {
    if (!editor) return
    // This means new shapes (or text) will use this color by default
  }, [editor, currentUser])

  // A function to switch to a particular avatar
  const handleSelectAvatar = (
    e: MouseEvent<HTMLButtonElement>,
    avatar: typeof avatars[number]
  ) => {
    e.preventDefault()
    setCurrentUser(avatar)
  }

  // Save the current shapes
  const handleSave = () => {
    if (!editor) return
    const snapshot = editor.store.query.records("shape").get()
    saveDoc({ id: PROJECT_ID, data: snapshot })
  }

  if (isLoading) {
    return <p>Loading doc from server...</p>
  }
  if (isError) {
    return <p>Error loading doc. Check logs!</p>
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            {/* Render 3 avatars as buttons to simulate different users */}
            {avatars.map((av) => (
              <button
                key={av.name}
                onClick={(e) => handleSelectAvatar(e, av)}
                className="group relative"
              >
                <Avatar className="transition-opacity group-hover:opacity-80">
                  <AvatarImage
                    // your actual image if needed
                    src="https://github.com/shadcn.png"
                    alt={av.name}
                  />
                  <AvatarFallback>
                    {av.initials.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Show a ring if this avatar is active */}
                {currentUser.name === av.name && (
                  <span
                    className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: av.color }}
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h2 className="text-sm mb-2">
            Current user:{" "}
            <span style={{ color: currentUser.color }}>
              {currentUser.name} ({currentUser.initials})
            </span>
          </h2>

          <div
            className="relative min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden"
            onPointerMove={(e) => {
              // get bounding rect offset if needed
              setPointer({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
            }}
          >
            <Tldraw onMount={handleEditorMount} />
            {/* colored cursor overlay */}
            <div
              className="pointer-events-none absolute flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-medium"
              style={{
                left: pointer.x,
                top: pointer.y,
                transform: "translate(50%, 50%)",
                backgroundColor: currentUser.color,
              }}
            >
              {currentUser.initials}
            </div>
          </div>

          <pre className="bg-gray-100 text-xs p-2 rounded max-h-60 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          {saveError && (
            <p className="text-red-500">Error: {saveError.message}</p>
          )}

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