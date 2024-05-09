import { useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors"
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode } from "@/types/type";

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updatemyPresece] = useMyPresence() as any;
    const [cursorState, setCursorState] = useState({ mode: CursorMode.Hidden });

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        setCursorState({ mode: CursorMode.Hidden});

        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updatemyPresece({ cursor: { x, y } });
    }, []);

    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        updatemyPresece({ cursor: null, message: null });
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updatemyPresece({ cursor: { x, y } });
    }, []);
    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if(e.key === "/"){
                setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
            }else if(e.key === "Escape"){
                setCursorState({ mode: CursorMode.Hidden });
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if(e.key === "/"){
                e.preventDefault();
            }
        }

    
            window.addEventListener("keydown", onKeyDown);
            window.addEventListener("keyup", onKeyUp);

            return () => {
                window.removeEventListener("keydown", onKeyDown);
                window.removeEventListener("keyup", onKeyUp);
            }
    }   , [updatemyPresece]);

    return (
        <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        className="h-[100vh] w-full flex justify-center items-center text-center 
        text-2xl text-white border-2 border-green-500"
        >
            <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>

            {cursor && (
                <CursorChat 
                cursor = {cursor}
                cursorState = {cursorState}
                setCursorState = {setCursorState}
                updatemyPresece = {updatemyPresece}
                />
                )}
            <LiveCursors others={others}/>
        </div>
    )
}

export default Live