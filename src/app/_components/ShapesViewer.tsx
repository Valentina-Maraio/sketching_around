import { useEffect, useRef, useCallback } from "react";
import { Tldraw, type Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { trpc } from "@/utils/trpc";

export default function ShapesViewer() {
    const editorRef = useRef<Editor | null>(null);

    // Force `refetch()` when HistoryPage is opened
    const { data: storedShapes, isLoading, isError, refetch } = trpc.store.getStore.useQuery(undefined, {
        staleTime: 0, 
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleEditorMount = useCallback((editor: Editor) => {
        editorRef.current = editor;

        if (storedShapes?.document && Array.isArray(storedShapes.document) && storedShapes.document.length > 0) {
            console.log("Loading latest shapes from API:", storedShapes.document);
            editor.store.put(storedShapes.document);
        }
    }, [storedShapes]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading shapes.</div>;

    return (
        <div className="relative min-h-[500px] w-full rounded-xl bg-muted/50 overflow-hidden">
            <Tldraw onMount={handleEditorMount} />
        </div>
    );
}
