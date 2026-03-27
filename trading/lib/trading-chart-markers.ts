import * as am5 from "@amcharts/amcharts5";

import {
  ChartMarkerDatum,
  ResultMarkerDatum,
  getCssVar,
  type ChartColors,
} from "@/lib/trading-chart";

function createBalloonMarker(
  root: am5.Root,
  accentColor: am5.Color,
  text: string,
  options?: {
    textColor?: am5.Color;
    width?: number;
    height?: number;
    fontSize?: number;
    fontWeight?: "500" | "600" | "700" | "normal" | "bold";
    fontFamily?: string;
  },
) {
  const width = options?.width ?? 84;
  const height = options?.height ?? 28;
  const pointerLength = 8;
  const shadowColor = am5.Color.fromString(
    getCssVar("--platform-overlay-backdrop-color", "#0f172a"),
  );
  const textColor =
    options?.textColor ??
    am5.Color.fromString(getCssVar("--platform-header-text-color", "#ffffff"));

  const outer = am5.Container.new(root, {
    centerX: am5.p50,
    centerY: am5.p100,
    dy: -10,
    layout: root.verticalLayout,
    interactive: false,
  });

  const balloon = outer.children.push(
    am5.Container.new(root, {
      width,
      height: height + pointerLength,
      centerX: am5.p50,
      centerY: am5.p100,
    }),
  );

  balloon.children.push(
    am5.PointedRectangle.new(root, {
      width,
      height,
      x: am5.p50,
      centerX: am5.p50,
      y: 0,
      fill: accentColor,
      strokeOpacity: 0,
      pointerBaseWidth: 12,
      pointerLength,
      pointerX: width / 2,
      pointerY: height + pointerLength,
      cornerRadius: height / 2,
      shadowColor,
      shadowBlur: 12,
      shadowOffsetY: 6,
    }),
  );

  balloon.children.push(
    am5.Label.new(root, {
      text,
      x: am5.p50,
      centerX: am5.p50,
      y: height / 2,
      centerY: am5.p50,
      fill: textColor,
      fontSize: options?.fontSize ?? 12,
      fontWeight: options?.fontWeight ?? "600",
      fontFamily: options?.fontFamily ?? "monospace",
    }),
  );

  outer.children.push(
    am5.Rectangle.new(root, {
      width: 1,
      height: 10,
      fill: accentColor,
      fillOpacity: 0.9,
      x: am5.p50,
      centerX: am5.p50,
    }),
  );

  outer.children.push(
    am5.Circle.new(root, {
      radius: 4,
      fill: accentColor,
      stroke: textColor,
      strokeWidth: 1,
      x: am5.p50,
      centerX: am5.p50,
      shadowColor: accentColor,
      shadowBlur: 8,
    }),
  );

  return outer;
}

export function createEntryMarkerSprite(
  root: am5.Root,
  data: ChartMarkerDatum,
  colors: ChartColors,
) {
  const accent = am5.color(
    data.type === "buy" ? colors.success : colors.danger,
  );

  return createBalloonMarker(root, accent, `$${data.value.toFixed(2)}`, {
    width: 62,
    height: 22,
    fontSize: 10,
    fontWeight: "700",
  });
}

export function createResultMarkerSprite(
  root: am5.Root,
  data: ResultMarkerDatum,
  colors: ChartColors,
  onDismiss: (operationId: string) => void,
) {
  const accent = am5.color(
    data.result === "win" ? colors.success : colors.danger,
  );
  const textColor = am5.Color.fromString(colors.text.primary);
  const shadowColor = am5.Color.fromString(
    getCssVar("--platform-overlay-backdrop-color", "#0f172a"),
  );
  const profitText =
    data.result === "win"
      ? `+$${data.profit.toFixed(2)}`
      : `-$${data.value.toFixed(2)}`;
  const titleText = data.result === "win" ? "VITORIA (L/P)" : "DERROTA (L/P)";
  const outer = am5.Container.new(root, {
    centerX: am5.p50,
    centerY: am5.p100,
    dy: -10,
    layout: root.verticalLayout,
    interactive: true,
    interactiveChildren: true,
  });

  const width = 150;
  const height = 54;
  const pointerLength = 8;

  const balloon = outer.children.push(
    am5.Container.new(root, {
      width,
      height: height + pointerLength,
      centerX: am5.p50,
      centerY: am5.p100,
      interactive: true,
      interactiveChildren: true,
    }),
  );

  balloon.children.push(
    am5.PointedRectangle.new(root, {
      width,
      height,
      x: am5.p50,
      centerX: am5.p50,
      y: 0,
      fill: accent,
      fillOpacity: 0.9,
      strokeOpacity: 0,
      pointerBaseWidth: 12,
      pointerLength,
      pointerX: 20,
      pointerY: height + pointerLength,
      cornerRadius: 6,
      shadowColor,
      shadowBlur: 12,
      shadowOffsetY: 6,
    }),
  );

  balloon.children.push(
    am5.Label.new(root, {
      text: titleText,
      x: 14,
      y: 12,
      fill: textColor,
      fontSize: 10,
      fontWeight: "700",
    }),
  );

  balloon.children.push(
    am5.Label.new(root, {
      text: profitText,
      x: 14,
      y: 31,
      fill: textColor,
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "monospace",
    }),
  );

  const closeHit = balloon.children.push(
    am5.Container.new(root, {
      x: width - 24,
      y: 10,
      width: 14,
      height: 14,
      interactive: true,
      cursorOverStyle: "pointer",
      background: am5.Circle.new(root, {
        radius: 8,
        fill: textColor,
        fillOpacity: 0.12,
        strokeOpacity: 0,
      }),
    }),
  );

  closeHit.children.push(
    am5.Label.new(root, {
      text: "x",
      centerX: am5.p50,
      centerY: am5.p50,
      x: am5.p50,
      y: am5.p50,
      fill: textColor,
      fontSize: 12,
      fontWeight: "700",
    }),
  );

  closeHit.events.on("click", () => {
    onDismiss(data.operationId);
  });

  outer.children.push(
    am5.Rectangle.new(root, {
      width: 1,
      height: 10,
      fill: accent,
      fillOpacity: 0.9,
      x: 20,
    }),
  );

  outer.children.push(
    am5.Circle.new(root, {
      radius: 4,
      fill: accent,
      stroke: textColor,
      strokeWidth: 1,
      x: 20,
      shadowColor: accent,
      shadowBlur: 8,
    }),
  );

  return outer;
}
