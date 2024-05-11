import { useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors"
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updatemyPresece] = useMyPresence() as any;
    const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
    const [reactions, setReaction] = useState<Reaction[]>([]);

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector){
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updatemyPresece({ cursor: { x, y } });
        }
        


        
    }, []);

    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        updatemyPresece({ cursor: null, message: null });
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updatemyPresece({ cursor: { x, y } });

        setCursorState((state: CursorState) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state)

    }, [cursorState.mode, setCursorState]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
       

        setCursorState((state: CursorState) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state)

    }, [cursorState.mode, setCursorState]);

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if(e.key === "/"){
                setCursorState({ 
                    mode: CursorMode.Chat, 
                    previousMessage: null, 
                    message: "" });
            }else if(e.key === "Escape"){
                setCursorState({ mode: CursorMode.Hidden })
            }else if(e.key === "e"){
                setCursorState({ mode: CursorMode.ReactionSelector })
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
    }}   , [updatemyPresece]);

        const setReactions = useCallback((reaction: string) => {
            setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
        }, []);

    return (
        <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="h-[100vh] w-full flex justify-center items-center text-center 
        text-2xl text-white border-2 border-green-500"
        >
            <h1 className="text-2xl text-white">Liveblocks Figma Clone</h1>

            {cursor && (
                <CursorChat 
                cursor = {cursor}
                cursorState = {cursorState}
                setCursorState = {setCursorState}
                updateMyPresence = {updatemyPresece}
                />
            )}
            
            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                setReaction={setReactions}
                />
            )}

            <LiveCursors others={others}/>
        </div>
    )
}

export default Live