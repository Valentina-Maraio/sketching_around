"use client";

import { useState, useCallback, MouseEvent, useRef } from "react";
import { cn } from "@/lib/utils";
// Sidebar stuff
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
import { Tldraw, type Editor, TLShapeId } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

// TRPC hooks
import { trpc } from "@/utils/trpc";
import { StaticImageData } from "next/image";

//profile images
import profile1 from '../../../public/profile_pictures/profile1.jpg'
import profile2 from '../../../public/profile_pictures/profile2.jpg'
import profile3 from '../../../public/profile_pictures/profile3.png'

interface AvatarInfo {
    name: string;
    initials: string;
    color: string;
    profile: StaticImageData;
}

// Define the type for drawing shape props
interface DrawingShapeProps {
    points: { x: number; y: number; pressure: number }[];
}

export default function Dashboard() {
    const avatars: AvatarInfo[] = [
        { name: "Alice", initials: "AL", color: "#e11d48", profile: profile1 },
        { name: "Bob", initials: "BO", color: "#3b82f6", profile: profile2 },
        { name: "Cara", initials: "CA", color: "#10b981", profile: profile3 },
    ];
    const [showAlert, setShowAlert] = useState(false);
    const [currentUser, setCurrentUser] = useState<AvatarInfo>(avatars[0]);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
    const editorRef = useRef<Editor | null>(null);


    // TRPC: Use hooks instead of direct method calls.
    const { data: initialData } = trpc.store.getStore.useQuery();
    const updateStoreMutation = trpc.store.updateStore.useMutation();

    // Called when Tldraw mounts; get the editor instance from onMount
    const handleEditorMount = useCallback((editor: Editor) => {
        editorRef.current = editor;

        // Load saved shapes from API when opening the whiteboard
        if (initialData?.document && Array.isArray(initialData.document) && initialData.document.length > 0) {
            editor.store.put(initialData.document);
        }

        // Save shapes immediately when they change
        const unsubscribe = editor.store.listen(() => {
            const shapesSnapshot = editor.store.allRecords();
            updateStoreMutation.mutate({ storeData: shapesSnapshot });
        });

        return () => unsubscribe();
    }, [initialData, updateStoreMutation]);





    // Switch avatars.
    const handleSelectAvatar = (e: MouseEvent<HTMLButtonElement>, avatar: AvatarInfo) => {
        e.preventDefault();
        setCurrentUser(avatar);
    };

    // Modify a shape programmatically.
    const handleModifyShape = async () => {
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

        // Wait for API update to complete
        const updatedStoreSnapshot = editorRef.current.store.allRecords();
        await updateStoreMutation.mutateAsync({ storeData: updatedStoreSnapshot });


        updateStoreMutation.mutate({ storeData: updatedStoreSnapshot });
    };

    // AI-Powered Drawing Transformation
    const handleAIDrawingTransform = async () => {
        if (!editorRef.current) return;

        // Get the currently selected shape ID(s)
        const selectedShapeIds = editorRef.current.getSelectedShapeIds();
        if (selectedShapeIds.length === 0) {
            setShowAlert(true);
            return;
        }

        // Retrieve the selected shape
        const shape = editorRef.current.getShape(selectedShapeIds[0]);


        if (!shape) {
            alert("Selected shape not found.");
            return;
        }

        // Make sure we're working with a freehand drawing shape
        if (shape.type !== "draw") {
            alert(`Please select a freehand drawing to transform. Shape type is: ${shape.type}`);
            return;
        }

        // Extract drawing data from the "segments" property instead of "points"
        const segments = (shape.props as any).segments;
        if (!segments || !Array.isArray(segments)) {
            alert("Could not extract drawing data. No segments found.");
            return;
        }

        // Use the segments array as the drawing data to send to the API
        const drawingData = segments;
        console.log("Extracted drawing data:", drawingData);

        try {
            // Send drawing data to the API endpoint
            const response = await fetch("/api/transform-drawing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ drawingData }),
            });

            if (!response.ok) {
                console.error("API responded with an error:", response.status, response.statusText);
                alert(`API Error: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json();
            if (data.error || !data.imageUrl) {
                alert("Transformation failed.");
                return;
            }

            const imageUrl = data.imageUrl;

            // Delete the original freehand drawing shape
            editorRef.current.deleteShapes([shape.id]);

            // Create a new image shape on the current page with the AI-generated image
            const newShape = editorRef.current.createShape({
                type: "image",
                parentId: editorRef.current.getCurrentPageId(), // Ensure it is added to the current page
                props: {
                    src: imageUrl,
                    w: 200,
                    h: 200,
                },
            });

            // Update the store snapshot with the new shape
            const updatedStoreSnapshot = editorRef.current.store.allRecords();
            await updateStoreMutation.mutateAsync({ storeData: updatedStoreSnapshot });
        } catch (error) {
            console.error("Error calling transform API:", error);
            alert("Failed to transform drawing.");
        }
    };




    return (
        <SidebarProvider>
            <SidebarInset>
                <header className={cn(
                    "flex h-[150px] shrink-0 items-center justify-between px-6 py-4 border-b border-border/10 transition-all duration-200 mb-4",
                    "md:px-8",
                    "dark:border-border/50",
                    "bg-background/90 backdrop-blur-sm", 
                    "bg-gradient-to-r from-sky-500/30 via-purple-500/30 to-pink-500/30"
                )}>
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-2" />
                        <Separator orientation="vertical" className="h-6" /> 
                    </div>

                    <div className="flex items-center space-x-4"> 
                        <Button onClick={handleModifyShape} variant="outline">Modify Shape</Button>
                        <Button onClick={handleAIDrawingTransform}>Transform Drawing (AI)</Button>
                    </div>


                    <div className="flex items-center gap-3">
                        {avatars.map((av) => (
                            <button
                                key={av.name}
                                onClick={(e) => handleSelectAvatar(e, av)}
                                className="group relative"
                            >
                                <Avatar className="transition-opacity group-hover:opacity-80 w-8 h-8 border border-gray-300 rounded-full"> {/* Explicit width/height */}
                                    {av.profile ? (
                                        <AvatarImage src={av.profile.src} alt={av.name} />
                                    ) : (
                                        <AvatarFallback>{av.initials.toUpperCase()}</AvatarFallback>
                                    )}
                                </Avatar>
                                {currentUser.name === av.name && (
                                    <span
                                        className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ring-2 ring-white dark:ring-neutral-900" // Dark mode ring
                                        style={{ backgroundColor: av.color }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div
                        className="relative min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden"
                        onPointerMove={(e) => {
                            setPointer({
                                x: e.nativeEvent.offsetX,
                                y: e.nativeEvent.offsetY,
                            });
                        }}
                    >
                        <Tldraw onMount={handleEditorMount} />
                        <div
                            className={`fixed inset-0 z-50 flex items-center justify-center ${showAlert ? 'block' : 'hidden'
                                }`}
                        >
                            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAlert(false)}></div>
                            <Alert className="relative z-10 w-[90%] max-w-md p-6 bg-white rounded-lg shadow-lg">
                                <AlertTitle className="text-lg font-bold">Something's missing</AlertTitle>
                                <AlertDescription className="mt-2 text-sm">
                                    Select a shape to modify it.
                                </AlertDescription>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline" onClick={() => setShowAlert(false)}>
                                        Close
                                    </Button>
                                </div>
                            </Alert>
                        </div>
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
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
