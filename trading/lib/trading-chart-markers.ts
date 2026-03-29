import * as am5 from "@amcharts/amcharts5";

import {
  ChartMarkerDatum,
  ResultMarkerDatum,
  getCssVar,
  type ChartColors,
} from "@/lib/trading-chart";

function formatMarkerAmount(value: number) {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    const compactValue = absValue / 1_000_000;
    return `$${compactValue.toFixed(compactValue >= 10 ? 0 : 1)}M`;
  }

  if (absValue >= 1_000) {
    const compactValue = absValue / 1_000;
    return `$${compactValue.toFixed(compactValue >= 10 ? 0 : 1)}K`;
  }

  if (absValue >= 100) {
    return `$${absValue.toFixed(0)}`;
  }

  return `$${absValue.toFixed(2)}`;
}

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
  const textColor = am5.Color.fromString(
    getCssVar("--platform-header-text-color", "#ffffff"),
  );

  const width = 56;
  const height = 20;
  const pointerLength = 6;

  const outer = am5.Container.new(root, {
    centerX: am5.p50,
    centerY: am5.p100,
    dy: -4,
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
      fill: accent,
      strokeOpacity: 0,
      pointerBaseWidth: 10,
      pointerLength,
      pointerX: width / 2,
      pointerY: height + pointerLength,
      cornerRadius: 4,
    }),
  );

  balloon.children.push(
    am5.Label.new(root, {
      text: `$${data.value.toFixed(2)}`,
      x: am5.p50,
      centerX: am5.p50,
      y: height / 2,
      centerY: am5.p50,
      fill: textColor,
      fontSize: 10,
      fontWeight: "700",
      fontFamily: "monospace",
    }),
  );

  return outer;
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
  const markerAmount = data.result === "win" ? data.profit : data.value;
  const profitText = `${data.result === "win" ? "+" : "-"}${formatMarkerAmount(markerAmount)}`;
  const titleText = data.result === "win" ? "VITORIA" : "PERDA";
  const outer = am5.Container.new(root, {
    centerX: am5.p50,
    centerY: am5.p100,
    dy: -8,
    layout: root.verticalLayout,
    interactive: true,
    interactiveChildren: true,
  });

  const width = 112;
  const height = 40;
  const pointerLength = 7;

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
      pointerBaseWidth: 10,
      pointerLength,
      pointerX: width / 2,
      pointerY: height + pointerLength,
      cornerRadius: 10,
      shadowColor,
      shadowBlur: 12,
      shadowOffsetY: 6,
    }),
  );

  balloon.children.push(
    am5.Label.new(root, {
      text: titleText,
      width: width - 28,
      x: am5.p50,
      centerX: am5.p50,
      y: 8,
      fill: textColor,
      textAlign: "center",
      oversizedBehavior: "fit",
      fontSize: 8,
      fontWeight: "700",
    }),
  );

  balloon.children.push(
    am5.Label.new(root, {
      text: profitText,
      width: width - 24,
      x: am5.p50,
      centerX: am5.p50,
      y: 20,
      fill: textColor,
      textAlign: "center",
      oversizedBehavior: "fit",
      fontSize: 11,
      fontWeight: "700",
      fontFamily: "monospace",
    }),
  );

  const closeHit = balloon.children.push(
    am5.Container.new(root, {
      x: width - 18,
      y: 7,
      width: 10,
      height: 10,
      interactive: true,
      cursorOverStyle: "pointer",
      background: am5.Circle.new(root, {
        radius: 6,
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
      fontSize: 9,
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
      x: am5.p50,
      centerX: am5.p50,
    }),
  );

  outer.children.push(
    am5.Circle.new(root, {
      radius: 4,
      fill: accent,
      stroke: textColor,
      strokeWidth: 1,
      x: am5.p50,
      centerX: am5.p50,
      shadowColor: accent,
      shadowBlur: 8,
    }),
  );

  return outer;
}
