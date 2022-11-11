import { useState, useRef, useEffect, MouseEvent } from "react";
import { useTheme } from "@mui/material/styles";
import GbLogo from "../../rom/GbLogo";

const WIDTH = 48;
const HEIGHT = 8;

interface GbLogoProps {
  logo: GbLogo;
  updateLogo: () => any;
}

type Context = CanvasRenderingContext2D;

type CursorCoord = number | null;

export default function GbLogoCanvas(props: GbLogoProps) {
  const [cursorXY, setCursorXY] = useState<[CursorCoord, CursorCoord]>([
    null,
    null,
  ]);
  const theme = useTheme();
  const ref = useRef<HTMLCanvasElement>(null);

  const scale = theme.typography.fontSize;
  const width = WIDTH * scale;
  const height = HEIGHT * scale;
  const pixelColor = theme.palette.text.primary;
  const gridColor = theme.palette.text.secondary;

  const getCursorXY = (event: MouseEvent): [CursorCoord, CursorCoord] => {
    const target = event.target;
    if (!(target instanceof Element)) return [null, null];
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.x) / scale) >>> 0;
    const y = ((event.clientY - rect.y) / scale) >>> 0;
    return [x, y];
  };

  const drawGraph = (ctx: Context) => {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.25;
    ctx.beginPath();
    for (let xI = 0; xI <= 48; xI++) {
      const lineX = xI * scale;
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, height);
    }

    for (let yI = 0; yI <= 8; yI++) {
      const lineY = yI * scale;
      ctx.moveTo(0, lineY);
      ctx.lineTo(width, lineY);
    }
    ctx.closePath();

    ctx.stroke();
  };

  const drawPixels = (ctx: Context) => {
    ctx.fillStyle = pixelColor;
    const [cursorX, cursorY] = cursorXY;

    props.logo.eachPixel((xI: number, yI: number, value: boolean) => {
      const underCursor = xI === cursorX && yI === cursorY;
      if (value !== underCursor)
        ctx.fillRect(xI * scale, yI * scale, scale, scale);
    });
  };

  const draw = (ctx: Context) => {
    ctx.clearRect(0, 0, width, height);
    drawPixels(ctx);
    drawGraph(ctx);
  };

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) return;
    const context = canvas.getContext("2d");
    if (context === null) return;
    draw(context);
  });

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      onMouseMove={(event) => {
        setCursorXY(getCursorXY(event));
      }}
      onMouseLeave={(event) => {
        setCursorXY([null, null]);
      }}
      onClick={(event) => {
        const [cursorX, cursorY] = getCursorXY(event);
        if (cursorX === null) return;
        if (cursorY === null) return;

        props.logo.togglePixel(cursorX, cursorY);
        props.updateLogo();
      }}
    />
  );
}
