import type { RefObject } from 'react'

export type CollaborativeCursorRefs = {
  aiCursorRef: RefObject<HTMLDivElement | null>
  larissaCursorRef: RefObject<HTMLDivElement | null>
  aiBoxRef: RefObject<HTMLDivElement | null>
  aiDimRef: RefObject<HTMLSpanElement | null>
  larissaBoxRef: RefObject<HTMLDivElement | null>
}

function CursorArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]"
      aria-hidden="true"
    >
      <path
        d="M4.5 3.5L19.5 10.7L12.6 12.9L10.3 19.8L4.5 3.5Z"
        fill="currentColor"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CrosshairIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    >
      <path
        d="M12 3V21M3 12H21"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M12 3V21M3 12H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CornerHandles({ borderClassName }: { borderClassName: string }) {
  return (
    <>
      <span
        className={`absolute -top-1 -left-1 size-2 border-[1.5px] bg-white ${borderClassName}`}
      />
      <span
        className={`absolute -top-1 -right-1 size-2 border-[1.5px] bg-white ${borderClassName}`}
      />
      <span
        className={`absolute -bottom-1 -left-1 size-2 border-[1.5px] bg-white ${borderClassName}`}
      />
      <span
        className={`absolute -bottom-1 -right-1 size-2 border-[1.5px] bg-white ${borderClassName}`}
      />
    </>
  )
}

export function CollaborativeCursors({
  aiCursorRef,
  larissaCursorRef,
  aiBoxRef,
  aiDimRef,
  larissaBoxRef,
}: CollaborativeCursorRefs) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* AI selection marquee & dimension guides */}
      <div
        ref={aiBoxRef}
        className="invisible fixed top-0 left-0 border-[1.5px] border-cursor-ai bg-cursor-ai/5 opacity-0"
      >
        <CornerHandles borderClassName="border-cursor-ai" />
        <span
          ref={aiDimRef}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-xs bg-cursor-ai px-1.5 py-0.5 font-mono text-[10px] leading-none font-semibold whitespace-nowrap text-white shadow-sm"
        >
          0 × 0
        </span>
      </div>

      {/* Larissa selection highlight box */}
      <div
        ref={larissaBoxRef}
        className="invisible fixed top-0 left-0 rounded-xs border-[1.5px] border-dashed border-cursor-larissa bg-cursor-larissa/5 opacity-0"
      >
        <CornerHandles borderClassName="border-cursor-larissa" />
      </div>

      {/* Virtual Cursor: IA */}
      <div
        ref={aiCursorRef}
        className="invisible fixed top-0 left-0 z-10 text-cursor-ai opacity-0 will-change-transform"
      >
        <div className="relative">
          <div data-cursor-mode="pointer">
            <CursorArrowIcon />
          </div>
          <div
            data-cursor-mode="crosshair"
            className="absolute top-0 left-0 opacity-0"
          >
            <CrosshairIcon />
          </div>
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-cursor-ai px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-white shadow-md">
            <span className="size-1.5 rounded-full bg-white/90" />
            IA
          </span>
        </div>
      </div>

      {/* Virtual Cursor: Larissa */}
      <div
        ref={larissaCursorRef}
        className="invisible fixed top-0 left-0 z-10 text-cursor-larissa opacity-0 will-change-transform"
      >
        <div className="relative">
          <CursorArrowIcon />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-cursor-larissa px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-white shadow-md">
            <span className="size-1.5 rounded-full bg-white/90" />
            Larissa
          </span>
        </div>
      </div>
    </div>
  )
}
