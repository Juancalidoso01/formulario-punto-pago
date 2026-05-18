"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  SIGNATURE_PEN_CURSOR,
  SIGNATURE_PEN_CURSOR_DRAWING,
} from "@/lib/signature-pen-cursor";

export type SignaturePadHandle = {
  isEmpty: () => boolean;
  toBlob: () => Promise<Blob | null>;
  clear: () => void;
};

const WIDTH = 480;
const HEIGHT = 160;

function setSignaturePadHover(active: boolean) {
  if (typeof document === "undefined") return;
  if (active) {
    document.documentElement.setAttribute("data-signature-pad-hover", "");
  } else {
    document.documentElement.removeAttribute("data-signature-pad-hover");
  }
}

export const SignaturePad = forwardRef<SignaturePadHandle, object>(
  function SignaturePad(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const hasInkRef = useRef(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [finePointer, setFinePointer] = useState(false);

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = WIDTH * dpr;
      canvas.height = HEIGHT * dpr;
      canvas.style.width = `${WIDTH}px`;
      canvas.style.height = `${HEIGHT}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "#4749B6";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      hasInkRef.current = false;
    }, []);

    useEffect(() => {
      resizeCanvas();
    }, [resizeCanvas]);

    useEffect(() => () => setSignaturePadHover(false), []);

    useEffect(() => {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      const apply = () => setFinePointer(mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }, []);

    const pos = (e: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const r = canvas.getBoundingClientRect();
      const scaleX = r.width > 0 ? WIDTH / r.width : 1;
      const scaleY = r.height > 0 ? HEIGHT / r.height : 1;
      return {
        x: (e.clientX - r.left) * scaleX,
        y: (e.clientY - r.top) * scaleY,
      };
    };

    const penCursorStyle: CSSProperties | undefined = finePointer
      ? { cursor: isDrawing ? SIGNATURE_PEN_CURSOR_DRAWING : SIGNATURE_PEN_CURSOR }
      : undefined;

    useImperativeHandle(ref, () => ({
      isEmpty: () => !hasInkRef.current,
      toBlob: () =>
        new Promise((resolve) => {
          const canvas = canvasRef.current;
          if (!canvas) {
            resolve(null);
            return;
          }
          canvas.toBlob((b) => resolve(b), "image/png");
        }),
      clear: () => {
        resizeCanvas();
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Área de firma. Dibuje su firma con el mouse o el dedo."
        className={`signature-pad-canvas w-full max-w-[480px] touch-none rounded-lg border border-slate-200/90 bg-white shadow-sm${
          isDrawing ? " signature-pad-canvas--drawing" : ""
        }`}
        style={penCursorStyle}
        onPointerEnter={() => setSignaturePadHover(true)}
        onPointerLeave={() => {
          if (drawingRef.current) return;
          setIsDrawing(false);
          setSignaturePadHover(false);
        }}
        onPointerDown={(e) => {
          setSignaturePadHover(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          drawingRef.current = true;
          setIsDrawing(true);
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          const { x, y } = pos(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawingRef.current) return;
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          const { x, y } = pos(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
          hasInkRef.current = true;
        }}
        onPointerUp={(e) => {
          drawingRef.current = false;
          setIsDrawing(false);
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerCancel={() => {
          drawingRef.current = false;
          setIsDrawing(false);
          setSignaturePadHover(false);
        }}
      />
    );
  },
);

SignaturePad.displayName = "SignaturePad";
