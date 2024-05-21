"use client";
import { useBroadcastEvent, useEventListener, useMyPresence } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors"
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
  } from "@/components/ui/context-menu";
import { shortcuts } from "@/constants";
import { Comments } from "./comments/Comments";
  

type Props = {canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
undo: () => void;
redo: () => void;
};

const Live = ({canvasRef, undo, redo } : Props) => {
    
    const [{ cursor }, updatemyPresece] = useMyPresence();
    const broadcast = useBroadcastEvent();
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden, });
  
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
                    value: cursorState.reaction,
                },
            ]));
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            });
        }
    }, 100);
            useEventListener((eventData) => {
                const event = eventData.event;
                setReactions((reactions) => reactions.concat([
            
                    {
                        point: { x: event.x, y: event.y },
                        timestamp: Date.now(),
                        value: event.value,
                    },
                ]));
            });
    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if(e.key === "/"){
                setCursorState({ 
                    mode: CursorMode.Chat, 
                    previousMessage: null, 
                    message: "",});
            }else if(e.key === "Escape"){
                updatemyPresece({ message: ""})
                setCursorState({ mode: CursorMode.Hidden });
            }else if(e.key === "e"){
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

        updatemyPresece({ cursor: { x, y }, });
        }
        


        
    }, []);

    const handlePointerLeave = useCallback(() => {
        setCursorState({ mode: CursorMode.Hidden, });
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

    const handleContextMenuClick = useCallback((key: string) => {
        switch(key){
            case 'Chat':
                setCursorState({ 
                    mode: CursorMode.Chat, 
                    previousMessage: null, 
                    message: "" });
            break;
            case 'Reactions':
                setCursorState({ mode: CursorMode.ReactionSelector });
            break;
            case 'Undo':
                undo();
            break;
            case 'Redo':
                redo();
            break;
            default:
                break;

        }
        


    }, []);

    

        

    return (
        <ContextMenu>
        <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative h-full w-full flex flex-1 justify-center items-center"
        >
            <canvas ref={canvasRef}/>

            {reactions.map((reaction) => (
                <FlyingReaction
                key={reaction.timestamp.toString()}
                x={reaction.point.x}
                y={reaction.point.y}
                timestamp={reaction.timestamp}
                value={reaction.value}
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

            <LiveCursors />
            <Comments />

            

           
            
            
            
        </ContextMenuTrigger>
        <ContextMenuContent className="right-menu-content">
            {shortcuts.map((item) => (
                <ContextMenuItem key={item.key} onClick={ () => handleContextMenuClick(item.name)} className="right-menu-item">
                    <p>{item.name}</p>
                    <p className="text-xs text-primary-grey-300 ">{item.shortcut}</p>
                    </ContextMenuItem>
            ))}

        </ContextMenuContent>
        </ContextMenu>
    )
}

export default Live;