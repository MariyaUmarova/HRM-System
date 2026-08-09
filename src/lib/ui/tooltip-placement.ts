export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface TooltipPlacement {
  vertical: "top" | "bottom";
  horizontal: "left" | "right";
}

/**
 * Pure collision-aware placement: prefers opening below/left of the trigger,
 * but flips to stay inside the viewport near an edge.
 */
export function computeTooltipPlacement(
  triggerRect: Rect,
  viewport: Viewport,
  panelSize: { width: number; height: number } = { width: 260, height: 140 },
): TooltipPlacement {
  const spaceBelow = viewport.height - triggerRect.bottom;
  const spaceRight = viewport.width - triggerRect.left;

  return {
    vertical: spaceBelow < panelSize.height ? "top" : "bottom",
    horizontal: spaceRight < panelSize.width ? "right" : "left",
  };
}
