import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors"
import { use, useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

type Props = {canvasRef: React.MutableRefObject<HTMLCanvasElement | null>};

const Live = ({canvasRef } : Props) => {
    const others = useOthers();
    const [{ cursor }, updatemyPresece] = useMyPresence() as any;
    const broadcast = useBroadcastEvent();
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
  
    const setReaction = useCallback((reaction: string) => {
            setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
        }, []);
        
    useInterval(() => {
        setReactions((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000))
    }, 1000);

    useInterval(() => {
        if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
            setReactions((reactions) => reactions.concat( [
            
                {
                    point: { x: cursor.x, y: cursor.y },
                    timestamp: Date.now(),
                    value: cursorState.reaction
                }
            ]));
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction
            });
        }
    }, 100);
            useEventListener((eventData) => {
                const event = eventData.event as ReactionEvent;
                setReactions((reactions) => reactions.concat( [
            
                    {
                        point: { x: event.x, y: event.y },
                        timestamp: Date.now(),
                        value: event.value,
                    }
                ]))
            })
    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if(e.key === '/'){
                setCursorState({ 
                    mode: CursorMode.Chat, 
                    previousMessage: null, 
                    message: "" });
            }else if(e.key === 'Escape'){
                setCursorState({ mode: CursorMode.Hidden });
            }else if(e.key === 'e'){
                setCursorState({ mode: CursorMode.ReactionSelector });
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if(e.key === '/'){
                e.preventDefault();
            }
        };

    
            window.addEventListener("keydown", onKeyDown);
            window.addEventListener("keyup", onKeyUp);

            return () => {
                window.removeEventListener("keydown", onKeyDown);
                window.removeEventListener("keyup", onKeyUp);
            }
            }}   , [updatemyPresece]);


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
       

        setCursorState((state: CursorState) => cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state)

    }, [cursorState.mode, setCursorState]);

    

        

    return (
        <div
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="h-[100vh] w-full flex justify-center items-center text-center"
        >
            <canvas ref={canvasRef}/>

            {reactions.map((r) => (
                <FlyingReaction
                key={r.timestamp.toString()}
                x={r.point.x}
                y={r.point.y}
                timestamp={r.timestamp}
                value={r.value}
                />
            ))}

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
                setReaction={(reaction) => {
                    setReaction(reaction);
                }}
            
                    
                
                />
            )}

            <LiveCursors others={others}/>
        </div>
    )
}

export default Live;