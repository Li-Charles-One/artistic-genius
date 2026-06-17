import type { RefObject } from "react";
import { useLayoutEffect, useRef } from "react";
import { DUR_BASE, EASE_OUT, prefersReducedMotion } from "./animations";

type CollapseOptions = {
  duration?: number;
  ease?: string;
  onOpenComplete?: () => void;
  onCloseComplete?: () => void;
  prevHeight?: number;
};

export function useCollapseAnimation(ref: RefObject<HTMLElement | null>, open: boolean, opts?: CollapseOptions) {
  const prevOpen = useRef<boolean | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const onOpenRef = useRef(opts?.onOpenComplete);
  const onCloseRef = useRef(opts?.onCloseComplete);
  onOpenRef.current = opts?.onOpenComplete;
  onCloseRef.current = opts?.onCloseComplete;

  useLayoutEffect(() => {
    return () => {
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prevOpen.current === null) {
      prevOpen.current = open;
      el.style.height = open ? "auto" : "0px";
      return;
    }

    if (prevOpen.current === open) return;
    prevOpen.current = open;

    const currentHeight = el.getBoundingClientRect().height;
    animationRef.current?.cancel();
    animationRef.current = null;

    const duration = prefersReducedMotion() ? 1 : (opts?.duration ?? DUR_BASE);
    const easing = opts?.ease ?? EASE_OUT;

    if (open) {
      el.style.height = "auto";
      const targetHeight = el.scrollHeight;
      if (duration <= 1 || Math.abs(currentHeight - targetHeight) < 1) {
        el.style.height = "auto";
        onOpenRef.current?.();
        return;
      }

      el.style.height = `${currentHeight}px`;
      const animation = el.animate([{ height: `${currentHeight}px` }, { height: `${targetHeight}px` }], { duration, easing });
      animationRef.current = animation;
      animation.onfinish = () => {
        if (animationRef.current === animation) animationRef.current = null;
        el.style.height = "auto";
        onOpenRef.current?.();
      };
      animation.oncancel = () => {
        if (animationRef.current === animation) animationRef.current = null;
      };
      return;
    }

    let startHeight = opts?.prevHeight && opts.prevHeight > 0 ? opts.prevHeight : currentHeight;
    if (startHeight <= 0) {
      el.style.height = "auto";
      startHeight = el.scrollHeight;
    }

    if (duration <= 1 || startHeight <= 0) {
      el.style.height = "0px";
      onCloseRef.current?.();
      return;
    }

    el.style.height = `${startHeight}px`;
    const animation = el.animate([{ height: `${startHeight}px` }, { height: "0px" }], { duration, easing });
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current === animation) animationRef.current = null;
      el.style.height = "0px";
      onCloseRef.current?.();
    };
    animation.oncancel = () => {
      if (animationRef.current === animation) animationRef.current = null;
    };
  }, [open, ref, opts?.duration, opts?.ease, opts?.prevHeight]);
}
