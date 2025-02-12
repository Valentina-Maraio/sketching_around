"use client";

import { useState, useCallback, MouseEvent, useRef } from "react";
// Sidebar stuff
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Import Tldraw components and types
import { Tldraw, type Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

// TRPC hooks
import { trpc } from "@/utils/trpc";

interface AvatarInfo {
    name: string;
    initials: string;
    color: string;
}

export default function Dashboard() {
    const avatars: AvatarInfo[] = [
        { name: "Alice", initials: "AL", color: "#e11d48" },
        { name: "Bob", initials: "BO", color: "#3b82f6" },
        { name: "Cara", initials: "CA", color: "#10b981" },
    ];
    const [showAlert, setShowAlert] = useState(false);
    const [currentUser, setCurrentUser] = useState<AvatarInfo>(avatars[0]);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
    const [selectedPlaygroundItem, setSelectedPlaygroundItem] = useState<any>(null);
    const editorRef = useRef<Editor | null>(null);


    // TRPC: Use hooks instead of direct method calls.
    const { data: initialData } = trpc.store.getStore.useQuery();
    const updateStoreMutation = trpc.store.updateStore.useMutation();

    // Debounce function
    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };


    // Called when Tldraw mounts; get the editor instance from onMount
    const handleEditorMount = useCallback((editor: Editor) => {
        editorRef.current = editor;

        const unsubscribe = editor.store.listen(() => {
            const shapesSnapshot = editor.store.allRecords();

            // Save directly to API instead of localStorage
            updateStoreMutation.mutate({ storeData: shapesSnapshot });
        });

        return () => unsubscribe();
    }, [updateStoreMutation]);




    // Switch avatars.
    const handleSelectAvatar = (e: MouseEvent<HTMLButtonElement>, avatar: AvatarInfo) => {
        e.preventDefault();
        setCurrentUser(avatar);
    };

    // Modify a shape programmatically.
    const handleModifyShape = () => {
        if (!editorRef.current) return;

        const selectedShapeIds = editorRef.current.getSelectedShapeIds();
        if (selectedShapeIds.length === 0) {
            setShowAlert(true);
            return;
        }

        // Modify the first selected shape (example)
        const updatedShape = {
            id: selectedShapeIds[0],
            type: "geo",
            props: {
                w: 200,
                h: 200,
                fill: "none",
                color: "yellow",
            },
        };

        editorRef.current.updateShapes([updatedShape]);

        // Extract only serializable shape data
        const updatedStoreSnapshot = editorRef.current.store.query.records("shape").get();



        updateStoreMutation.mutate({ storeData: updatedStoreSnapshot });
    };


    return (
        <SidebarProvider>
            <AppSidebar onPlaygroundItemClick={setSelectedPlaygroundItem} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear justify-between px-4"> {/* Key change here */}
                    <div className="flex items-center gap-2"> {/* Left side: Trigger and Separator */}
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                    <Button onClick={handleModifyShape}>Modify Shape</Button> {/* Middle: Button */}
                    <div className="flex items-center gap-2"> {/* Right side: Avatars */}
                        {avatars.map((av) => (
                            <button
                                key={av.name}
                                onClick={(e) => handleSelectAvatar(e, av)}
                                className="group relative"
                            >
                                <Avatar className="transition-opacity group-hover:opacity-80">
                                    <AvatarImage src="https://github.com/shadcn.png" alt={av.name} />
                                    <AvatarFallback>{av.initials.toUpperCase()}</AvatarFallback>
                                </Avatar>
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
                {/* ... rest of your component */}
            </SidebarInset>
        </SidebarProvider>
    );
}
