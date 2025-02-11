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

// tRPC (client)
import { trpc } from "@/utils/trpc"

interface AvatarInfo {
  name: string
  initials: string
  color: string
}

export default function Dashboard() {
  const PROJECT_ID = "project1"

  // tRPC hooks to get and save document data
  const { data, isLoading, isError, refetch } = trpc.document.getDoc.useQuery({
    id: PROJECT_ID,
  })
  const { mutate: saveDoc, status, error: saveError } =
    trpc.document.saveDoc.useMutation({
      onSuccess: () => refetch(),
    })
  const isSaving = status === "pending"

  // Store the Tldraw editor instance
  const [editor, setEditor] = useState<Editor | null>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [selectedPlaygroundItem, setSelectedPlaygroundItem] = useState<{
    title: string
    [key: string]: any
  } | null>(null)

  // For demonstration, define three avatars
  const avatars: AvatarInfo[] = [
    { name: "Alice", initials: "AL", color: "#e11d48" }, // red
    { name: "Bob", initials: "BO", color: "#3b82f6" },   // blue
    { name: "Cara", initials: "CA", color: "#10b981" },   // green
  ]
  // Current active user
  const [currentUser, setCurrentUser] = useState<AvatarInfo>(avatars[0])

  const handlePlaygroundItemClick = (item: any) => {
    setSelectedPlaygroundItem(item)
  }

  // Called when Tldraw mounts
  const handleEditorMount = (mountedEditor: Editor) => {
    setEditor(mountedEditor)
  }

  // When we receive document data, load it into the editor store
  useEffect(() => {
    if (!editor || data === undefined) return
    if (data) {
      editor.store.put(data) // merges saved shapes (including text)
    }
  }, [editor, data])

  // Auto-save: listen to changes on the editor's store
  // (Casting to any bypasses type issues with the HistoryEntry)
  useEffect(() => {
    if (!editor) return

    const unsubscribe = (editor.store.listen as any)(
      (entry: any) => {
        // Check for "put" or "update" actions that affect shapes.
        if (
          (entry.type === "put" || entry.type === "update") &&
          entry.records?.some((record: any) => record.typeName === "shape")
        ) {
          const snapshot = editor.store.query.records("shape").get()
          saveDoc({ id: PROJECT_ID, data: snapshot })
        }
      },
      { scope: "document" }
    )

    return () => {
      unsubscribe()
    }
  }, [editor, saveDoc])

  // Whenever currentUser changes, you might update new shapes’ default style here.
  useEffect(() => {
    if (!editor) return
    // For example, update the default style of new shapes to use currentUser.color.
  }, [editor, currentUser])

  // Switch to a particular avatar
  const handleSelectAvatar = (
    e: MouseEvent<HTMLButtonElement>,
    avatar: typeof avatars[number]
  ) => {
    e.preventDefault()
    setCurrentUser(avatar)
  }

  // Manual save of the current shapes
  const handleSave = () => {
    if (!editor) return
    const snapshot = editor.store.query.records("shape").get()
    saveDoc({ id: PROJECT_ID, data: snapshot })
  }

  // Button to programmatically modify a shape
  const handleModifyShape = () => {
    if (!editor) return

    // Retrieve the shapes using .get()
    const shapes = editor.store.query.records("shape").get()
    const shapeToModify = shapes[0]
    if (!shapeToModify) {
      alert("No shapes to modify!")
      return
    }

    // Modify the shape: move it 100px to the right and change its color to red.
    editor.store.put([
      {
        ...shapeToModify,
        x: (shapeToModify.x ?? 0) + 100,
        props: {
          ...shapeToModify.props,
          color: "red",
        },
      },
    ])

    // Immediately save the updated shapes
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
      <AppSidebar onPlaygroundItemClick={handlePlaygroundItemClick} />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
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
                    // Replace with your actual image if needed
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
          <div
            className="relative min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden"
            onPointerMove={(e) => {
              // Update the pointer's offset
              setPointer({
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY,
              })
            }}
          >
            {/* Tldraw editor */}
            <Tldraw onMount={handleEditorMount} />
            {/* Colored cursor overlay */}
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
            {/* Figma-inspired Collaborators Panel */}
            <div className="absolute top-4 right-4 flex items-center space-x-[-8px]">
              {avatars.map((av) => (
                <div key={av.name} className="w-10 h-10 border-2 border-white rounded-full">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt={av.name} />
                    <AvatarFallback>{av.initials}</AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </div>

          <pre className="bg-gray-100 text-xs p-2 rounded max-h-60 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          {saveError && (
            <p className="text-red-500">Error: {saveError.message}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {isSaving ? "Saving..." : "Save tldraw Doc"}
            </button>
            <button
              onClick={handleModifyShape}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Modify Shape
            </button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
