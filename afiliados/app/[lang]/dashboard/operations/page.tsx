"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart2,
  History,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatUsd } from "@shared/platform/branding"
import {
  subscribeToPriceUpdates,
  unsubscribeFromPriceUpdates,
  fetchCurrentPrice,
} from "@/lib/price-provider"

// ─── Types ────────────────────────────────────────────────────────────────

interface PendingOperation {
  id: string
  ativo: string
  previsao: string
  valor: number
  receita: number
  abertura: number
  fechamento: number | null
  tempo: string
  data: string
  resultado: string | null
  tipo: string | null
  status: string
  expiresAt: string | null
}

interface HistoryOperation extends PendingOperation {}

interface CandleData {
  Date: number
  Open: number
  High: number
  Low: number
  Close: number
}

// ─── Constants ────────────────────────────────────────────────────────────

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h"]
const POPULAR_PAIRS = [
  { symbol: "EURUSD", name: "EUR/USD", type: "forex" },
  { symbol: "GBPUSD", name: "GBP/USD", type: "forex" },
  { symbol: "USDJPY", name: "USD/JPY", type: "forex" },
  { symbol: "BTCUSDT", name: "BTC/USDT", type: "crypto" },
  { symbol: "ETHUSDT", name: "ETH/USDT", type: "crypto" },
]

function isCryptoSymbol(s: string) {
  return /USDT$|BUSD$|BTC$|ETH$|BNB$/i.test(s)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function formatPrice(p: number) {
  return p > 100 ? p.toFixed(2) : p.toFixed(5)
}

// ─── Fluid Candle Chart (IQ Option style, 60fps) ─────────────────────────

function CandlestickChart({
  candles,
  currentPrice,
  entryPrice,
  entryDirection,
  activeOp,
}: {
  candles: CandleData[]
  currentPrice: number | null
  entryPrice: number | null
  entryDirection: string | null
  activeOp: PendingOperation | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const worldMapRef = useRef<HTMLImageElement | null>(null)

  // Pre-load world map image once
  useEffect(() => {
    const img = new Image()
    img.src = "/world-map.png"
    img.onload = () => { worldMapRef.current = img }
  }, [])

  // Store mutable state in refs so the animation loop reads latest values
  // without causing re-renders
  const stateRef = useRef({
    candles: candles,
    currentPrice: currentPrice,
    entryPrice: entryPrice,
    entryDirection: entryDirection,
    activeOp: activeOp,
    smoothPrice: currentPrice ?? 0,
    pulsePhase: 0,
    // Smoothed price range — prevents any jump when entryPrice or new candles arrive
    loSmooth: 0,
    hiSmooth: 0,
    rangeReady: false,
  })

  // Keep refs in sync with props
  useEffect(() => { stateRef.current.candles = candles }, [candles])
  useEffect(() => {
    if (currentPrice !== null) {
      const s = stateRef.current
      // Seed smoothPrice immediately on first real price — never lerp from 0
      if (s.smoothPrice === 0 || !s.rangeReady) {
        s.smoothPrice = currentPrice
        s.rangeReady = false // force range reinit on next draw
      }
      s.currentPrice = currentPrice
    }
  }, [currentPrice])
  useEffect(() => { stateRef.current.entryPrice = entryPrice }, [entryPrice])
  useEffect(() => { stateRef.current.entryDirection = entryDirection }, [entryDirection])
  useEffect(() => { stateRef.current.activeOp = activeOp }, [activeOp])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")!
    let resizeObserver: ResizeObserver

    // Sizing — only resize canvas when dimensions actually change (avoids
    // flicker from tiny layout shifts caused by button disabled state changes)
    let W = 0, H = 0
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      const newW = Math.floor(rect.width)
      const newH = Math.floor(rect.height)
      if (newW === W && newH === H) return
      W = newW; H = newH
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + "px"
      canvas.style.height = H + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    // ─── Draw loop ───────────────────────────────────────────────
    const draw = () => {
      const s = stateRef.current
      const { candles: cds } = s

      // Smooth interpolation toward real price (lerp ~12% per frame → buttery)
      if (s.currentPrice !== null && s.smoothPrice !== 0) {
        s.smoothPrice = lerp(s.smoothPrice, s.currentPrice, 0.12)
      }
      s.pulsePhase += 0.06

      // Layout
      const PAD_T = 16, PAD_B = 24, PAD_R = 76, PAD_L = 8
      const chartW = W - PAD_L - PAD_R
      const chartH = H - PAD_T - PAD_B

      if (chartW <= 0 || chartH <= 0) { animRef.current = requestAnimationFrame(draw); return }

      // Candle sizing — wider like IQ Option
      const candleW = Math.max(6, Math.min(14, chartW / 60))
      const gap = Math.max(2, candleW * 0.35)
      const step = candleW + gap
      const maxVisible = Math.floor(chartW / step)
      const visible = cds.slice(-maxVisible)

      // ── Target price range (only candles + smoothPrice, NOT entryPrice)
      // entryPrice is always near current price — including it would shift the range
      // on trade placement and cause a visual zoom jump.
      let loTarget = Infinity, hiTarget = -Infinity
      for (const c of visible) {
        if (c.Low < loTarget) loTarget = c.Low
        if (c.High > hiTarget) hiTarget = c.High
      }
      if (s.smoothPrice > 0) {
        loTarget = Math.min(loTarget, s.smoothPrice)
        hiTarget = Math.max(hiTarget, s.smoothPrice)
      }
      if (loTarget === Infinity) { animRef.current = requestAnimationFrame(draw); return }

      const rawRange = hiTarget - loTarget || 1
      const marg = rawRange * 0.08
      loTarget -= marg; hiTarget += marg

      // ── Smooth the visible range (lerp 10% per frame — fast enough to
      //    stabilize in ~15 frames but still avoid jarring instant jumps)
      if (!s.rangeReady || s.loSmooth === 0) {
        s.loSmooth = loTarget; s.hiSmooth = hiTarget; s.rangeReady = true
      } else {
        s.loSmooth = lerp(s.loSmooth, loTarget, 0.10)
        s.hiSmooth = lerp(s.hiSmooth, hiTarget, 0.10)
      }

      const lo = s.loSmooth, hi = s.hiSmooth
      const total = hi - lo || 1
      const yOf = (p: number) => PAD_T + chartH * (1 - (p - lo) / total)

      // ── Background ──
      ctx.fillStyle = "#131722"
      ctx.fillRect(0, 0, W, H)

      // World map background with reduced opacity
      const worldMap = worldMapRef.current
      if (worldMap) {
        ctx.globalAlpha = 0.045
        ctx.drawImage(worldMap, PAD_L, PAD_T, chartW, chartH)
        ctx.globalAlpha = 1
      }

      // ── Grid lines (horizontal) ──
      const gridN = 5
      ctx.textAlign = "left"
      for (let i = 0; i <= gridN; i++) {
        const y = PAD_T + (chartH / gridN) * i
        // line
        ctx.strokeStyle = "rgba(255,255,255,0.04)"
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke()
        // label
        const price = hi - (total / gridN) * i
        ctx.fillStyle = "#555"
        ctx.font = "10px monospace"
        ctx.fillText(formatPrice(price), W - PAD_R + 6, y + 3)
      }

      // ── Candles ──
      const startX = PAD_L + chartW - visible.length * step
      for (let i = 0; i < visible.length; i++) {
        const c = visible[i]
        const cx = startX + i * step + candleW / 2
        const up = c.Close >= c.Open
        const col = up ? "#26a69a" : "#ef5350"

        // Wick
        ctx.strokeStyle = col
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(cx, yOf(c.High))
        ctx.lineTo(cx, yOf(c.Low))
        ctx.stroke()

        // Body
        const bTop = yOf(Math.max(c.Open, c.Close))
        const bBot = yOf(Math.min(c.Open, c.Close))
        const bH = Math.max(1.5, bBot - bTop)
        ctx.fillStyle = col
        ctx.beginPath()
        // Rounded rect for cleaner look
        const r = Math.min(1.5, candleW / 4)
        const bx = cx - candleW / 2, by = bTop, bw = candleW
        ctx.moveTo(bx + r, by)
        ctx.lineTo(bx + bw - r, by)
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r)
        ctx.lineTo(bx + bw, by + bH - r)
        ctx.quadraticCurveTo(bx + bw, by + bH, bx + bw - r, by + bH)
        ctx.lineTo(bx + r, by + bH)
        ctx.quadraticCurveTo(bx, by + bH, bx, by + bH - r)
        ctx.lineTo(bx, by + r)
        ctx.quadraticCurveTo(bx, by, bx + r, by)
        ctx.fill()
      }

      // ── Entry price line + exact candle tick ──
      if (s.entryPrice !== null && s.activeOp && visible.length > 0) {
        const ey = yOf(s.entryPrice)
        const isCall = s.activeOp.previsao === "call"
        const opTime = new Date(s.activeOp.data).getTime()

        // Find the candle where the trade was opened.
        // Default to the LAST visible candle (most common — trade was just placed).
        let entryCandleVisibleIdx = visible.length - 1
        const firstVisibleGlobalIdx = cds.length - visible.length
        for (let i = cds.length - 1; i >= 0; i--) {
          if (cds[i].Date <= opTime) {
            const vIdx = i - firstVisibleGlobalIdx
            // Only use if it falls within visible bounds
            if (vIdx >= 0 && vIdx < visible.length) {
              entryCandleVisibleIdx = vIdx
            }
            // If the entry candle scrolled off-screen, keep the last candle as fallback
            break
          }
        }

        const entryCandle = visible[entryCandleVisibleIdx]
        const ecX = startX + entryCandleVisibleIdx * step + candleW / 2

        // Vertical dashed line at entry candle
        ctx.strokeStyle = "rgba(245,158,11,0.25)"
        ctx.lineWidth = 1
        ctx.setLineDash([4, 3])
        ctx.beginPath()
        ctx.moveTo(ecX, PAD_T)
        ctx.lineTo(ecX, H - PAD_B)
        ctx.stroke()
        ctx.setLineDash([])

        // Horizontal dashed entry price line (from entry candle to right edge)
        ctx.strokeStyle = "rgba(245,158,11,0.45)"
        ctx.lineWidth = 1
        ctx.setLineDash([5, 4])
        ctx.beginPath(); ctx.moveTo(ecX, ey); ctx.lineTo(W - PAD_R, ey); ctx.stroke()
        ctx.setLineDash([])

        // ── Arrow tick exactly above/below the entry candle ──
        if (entryCandle) {
          const arrowColor = isCall ? "#26a69a" : "#ef5350"
          if (isCall) {
            // Arrow pointing UP above the candle high
            const tipY = yOf(entryCandle.High) - 6
            ctx.fillStyle = arrowColor
            ctx.beginPath()
            ctx.moveTo(ecX, tipY)                       // tip of arrow
            ctx.lineTo(ecX - 5, tipY + 9)
            ctx.lineTo(ecX - 2, tipY + 7)
            ctx.lineTo(ecX - 2, tipY + 14)
            ctx.lineTo(ecX + 2, tipY + 14)
            ctx.lineTo(ecX + 2, tipY + 7)
            ctx.lineTo(ecX + 5, tipY + 9)
            ctx.closePath()
            ctx.fill()
          } else {
            // Arrow pointing DOWN below the candle low
            const tipY = yOf(entryCandle.Low) + 6
            ctx.fillStyle = arrowColor
            ctx.beginPath()
            ctx.moveTo(ecX, tipY)                       // tip of arrow
            ctx.lineTo(ecX - 5, tipY - 9)
            ctx.lineTo(ecX - 2, tipY - 7)
            ctx.lineTo(ecX - 2, tipY - 14)
            ctx.lineTo(ecX + 2, tipY - 14)
            ctx.lineTo(ecX + 2, tipY - 7)
            ctx.lineTo(ecX + 5, tipY - 9)
            ctx.closePath()
            ctx.fill()
          }

          // Small value label next to the arrow
          const labelY = isCall
            ? yOf(entryCandle.High) - 22
            : yOf(entryCandle.Low) + 28
          ctx.fillStyle = "rgba(0,0,0,0.7)"
          roundRect(ctx, ecX - 22, labelY - 9, 44, 16, 3)
          ctx.fill()
          ctx.fillStyle = arrowColor
          ctx.font = "bold 9px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`$ ${s.activeOp.valor}`, ecX, labelY + 3)
        }

        // Entry price badge on right axis
        const badgeW = PAD_R - 4, badgeH = 16
        ctx.fillStyle = "#f59e0b"
        roundRect(ctx, W - PAD_R + 2, ey - badgeH / 2, badgeW, badgeH, 3)
        ctx.fill()
        ctx.fillStyle = "#000"
        ctx.font = "bold 9px monospace"
        ctx.textAlign = "left"
        ctx.fillText(formatPrice(s.entryPrice), W - PAD_R + 6, ey + 3)
      }

      // ── Current price line + badge ──
      if (s.smoothPrice > 0) {
        const py = yOf(s.smoothPrice)
        const hasEntry = s.entryPrice !== null && s.entryDirection
        const isWin = hasEntry
          ? s.entryDirection === "call" ? s.smoothPrice > s.entryPrice! : s.smoothPrice < s.entryPrice!
          : null
        const lineCol = isWin === null ? "#4fc3f7" : isWin ? "#26a69a" : "#ef5350"

        // Glowing line
        ctx.strokeStyle = lineCol
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.3
        ctx.beginPath(); ctx.moveTo(PAD_L, py); ctx.lineTo(W - PAD_R, py); ctx.stroke()
        ctx.globalAlpha = 1

        // Solid thin line
        ctx.strokeStyle = lineCol
        ctx.lineWidth = 0.7
        ctx.setLineDash([2, 3])
        ctx.beginPath(); ctx.moveTo(PAD_L, py); ctx.lineTo(W - PAD_R, py); ctx.stroke()
        ctx.setLineDash([])

        // Price badge (right side, larger like IQ Option)
        const bW = PAD_R - 2, bH = 22
        ctx.fillStyle = lineCol
        roundRect(ctx, W - PAD_R + 1, py - bH / 2, bW, bH, 3)
        ctx.fill()
        ctx.fillStyle = "#fff"
        ctx.font = "bold 11px monospace"
        ctx.textAlign = "left"
        ctx.fillText(formatPrice(s.smoothPrice), W - PAD_R + 5, py + 4)

        // Pulsing dot
        const pulse = 3 + Math.sin(s.pulsePhase) * 2
        ctx.beginPath()
        ctx.arc(W - PAD_R, py, pulse, 0, Math.PI * 2)
        ctx.fillStyle = lineCol
        ctx.globalAlpha = 0.6 + Math.sin(s.pulsePhase) * 0.4
        ctx.fill()
        ctx.globalAlpha = 1

        // Inner solid dot
        ctx.beginPath()
        ctx.arc(W - PAD_R, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = "#fff"
        ctx.fill()

        // ── P&L on chart ──
        if (hasEntry && s.entryPrice !== null) {
          const diff = s.smoothPrice - s.entryPrice
          const pct = ((Math.abs(diff) / s.entryPrice) * 100).toFixed(2)
          const sign = isWin ? "+" : "−"
          const entryY = yOf(s.entryPrice)
          const midY = (py + entryY) / 2

          // Background pill
          ctx.fillStyle = isWin ? "rgba(38,166,154,0.15)" : "rgba(239,83,80,0.15)"
          roundRect(ctx, W - PAD_R - 70, midY - 10, 62, 20, 4)
          ctx.fill()

          ctx.font = "bold 12px sans-serif"
          ctx.fillStyle = isWin ? "#26a69a" : "#ef5350"
          ctx.textAlign = "center"
          ctx.fillText(`${sign}${pct}%`, W - PAD_R - 39, midY + 4)
        }
      }

      // ── Countdown on chart (if active operation) ──
      if (s.activeOp && s.activeOp.expiresAt) {
        const remaining = new Date(s.activeOp.expiresAt).getTime() - Date.now()
        if (remaining > 0) {
          const secs = Math.floor(remaining / 1000)
          const mm = Math.floor(secs / 60).toString().padStart(2, "0")
          const ss = (secs % 60).toString().padStart(2, "0")

          // Timer circle at bottom-center of chart
          const tx = W - PAD_R - 30
          const ty = H - PAD_B - 20

          ctx.beginPath()
          ctx.arc(tx, ty, 16, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(0,0,0,0.6)"
          ctx.fill()

          // Arc progress
          const totalMs = new Date(s.activeOp.expiresAt).getTime() - new Date(s.activeOp.data).getTime()
          const prog = Math.max(0, remaining / totalMs)
          ctx.beginPath()
          ctx.arc(tx, ty, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog)
          ctx.strokeStyle = "rgba(245,158,11,0.6)"
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.fillStyle = "#fff"
          ctx.font = "bold 9px monospace"
          ctx.textAlign = "center"
          ctx.fillText(`:${ss}`, tx, ty + 3)
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      resizeObserver.disconnect()
    }
  }, []) // Empty deps — runs once, reads from refs

  return (
    <div ref={containerRef} className="w-full h-full" style={{ background: "#131722" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  )
}

// Canvas rounded rect helper
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── Active Operation Card ─────────────────────────────────────────────────

function ActiveOperationCard({
  operation,
  currentPrice,
  onExpired,
}: {
  operation: PendingOperation
  currentPrice: number | null
  onExpired: (id: string) => void
}) {
  const [progress, setProgress] = useState(100)
  const [displayTime, setDisplayTime] = useState("00:00")
  const [isWinning, setIsWinning] = useState<boolean | null>(null)

  const expiryMs = operation.expiresAt ? new Date(operation.expiresAt).getTime() : 0
  const entryMs = new Date(operation.data).getTime()
  const totalDuration = expiryMs - entryMs

  useEffect(() => {
    if (currentPrice === null) return
    const isCall = operation.previsao === "call"
    setIsWinning(isCall ? currentPrice > operation.abertura : currentPrice < operation.abertura)
  }, [currentPrice, operation.previsao, operation.abertura])

  useEffect(() => {
    if (!expiryMs) return
    const interval = setInterval(() => {
      const remaining = expiryMs - Date.now()
      if (remaining <= 0) {
        clearInterval(interval)
        setProgress(0)
        setDisplayTime("00:00")
        onExpired(operation.id)
        return
      }
      const s = Math.floor(remaining / 1000)
      const m = Math.floor(s / 60)
      setDisplayTime(`${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`)
      setProgress(Math.max(0, (remaining / totalDuration) * 100))
    }, 100)
    return () => clearInterval(interval)
  }, [expiryMs, totalDuration, operation.id, onExpired])

  // Resolved state
  if (operation.resultado === "ganho" || operation.resultado === "perda") {
    const isWin = operation.resultado === "ganho"
    return (
      <div className={cn(
        "rounded-lg p-3 mb-2 border",
        isWin ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
      )}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isWin ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
            <span className="font-medium text-sm">{operation.ativo}</span>
            <Badge variant="outline" className={cn("text-xs", isWin ? "text-green-500" : "text-red-500")}>
              {isWin ? "GANHO" : "PERDA"}
            </Badge>
          </div>
          <span className={cn("font-bold text-sm", isWin ? "text-green-500" : "text-red-500")}>
            {isWin
              ? `+${formatUsd(operation.receita)}`
              : `-${formatUsd(operation.valor)}`}
          </span>
        </div>
      </div>
    )
  }

  const isCall = operation.previsao === "call"
  const statusColor = "#f59e0b"
  const valueColor = isWinning === null ? statusColor : isWinning ? "#26a69a" : "#ef5350"
  const potentialValue = isWinning === null
    ? operation.valor
    : isWinning
      ? operation.valor + operation.receita
      : 0

  return (
    <div className="rounded-lg border border-[#2a2d37] bg-[#1e2130] p-3 mb-2 relative overflow-hidden">
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#333]">
        <div
          className="h-full transition-all duration-100"
          style={{ width: `${progress}%`, backgroundColor: valueColor }}
        />
      </div>

      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center",
            isCall ? "bg-green-500/20" : "bg-red-500/20"
          )}>
            {isCall ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
          </div>
          <span className="font-medium text-sm text-white">{operation.ativo}</span>
          {currentPrice && (
            <span className="text-xs text-gray-500">{formatPrice(currentPrice)}</span>
          )}
        </div>
        <span className="font-bold text-sm" style={{ color: valueColor }}>
          {formatUsd(potentialValue)}
        </span>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Entrada: {formatPrice(operation.abertura)}</span>
        <span>{operation.tempo}</span>
        <span style={{ color: valueColor }}>{displayTime}</span>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function OperationsPage() {
  // State
  const [selectedPair, setSelectedPair] = useState(POPULAR_PAIRS[0])
  const [selectedTimeframe, setSelectedTimeframe] = useState("5m")
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [candles, setCandles] = useState<CandleData[]>([])
  const [loadingCandles, setLoadingCandles] = useState(true)

  // Trading panel
  const [amount, setAmount] = useState(100)
  const [submitting, setSubmitting] = useState(false)

  // Active operations
  const [pendingOps, setPendingOps] = useState<PendingOperation[]>([])
  const [operationPrices, setOperationPrices] = useState<Record<string, number>>({})

  // History
  const [historyOps, setHistoryOps] = useState<HistoryOperation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Payout
  const [payoutRate] = useState(0.9)

  // Settlement polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/operations/settle", { method: "POST" }).catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch candles
  const fetchCandles = useCallback(async () => {
    setLoadingCandles(true)
    try {
      const symbol = selectedPair.symbol.toUpperCase()

      if (isCryptoSymbol(symbol)) {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${selectedTimeframe}&limit=200`
        )
        if (res.ok) {
          const data = await res.json()
          setCandles(data.map((k: any[]) => ({
            Date: k[0], Open: parseFloat(k[1]), High: parseFloat(k[2]),
            Low: parseFloat(k[3]), Close: parseFloat(k[4]),
          })))
        }
      } else {
        const kTypeMap: Record<string, number> = { "1m": 1, "5m": 2, "15m": 3, "30m": 4, "1h": 5 }
        const kType = kTypeMap[selectedTimeframe] ?? 1
        const apiKey = process.env.NEXT_PUBLIC_ITICK_API_KEY
        if (apiKey) {
          const res = await fetch(
            `https://api.itick.org/forex/kline?region=GB&code=${symbol}&kType=${kType}&limit=200`,
            { headers: { Accept: "application/json", token: apiKey } }
          )
          if (res.ok) {
            const json = await res.json()
            if (json.code === 0 && Array.isArray(json.data)) {
              setCandles(json.data.map((c: any) => ({
                Date: c.t, Open: c.o, High: c.h, Low: c.l, Close: c.c,
              })))
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching candles:", err)
    } finally {
      setLoadingCandles(false)
    }
  }, [selectedPair, selectedTimeframe])

  useEffect(() => { fetchCandles() }, [fetchCandles])

  // Auto-refresh candles periodically
  useEffect(() => {
    const ms = selectedTimeframe === "1m" ? 15000 : 30000
    const interval = setInterval(fetchCandles, ms)
    return () => clearInterval(interval)
  }, [fetchCandles, selectedTimeframe])

  // Real-time price
  useEffect(() => {
    const symbol = selectedPair.symbol
    const cb = (price: number) => setCurrentPrice(price)
    subscribeToPriceUpdates(symbol, cb)
    fetchCurrentPrice(symbol).then(setCurrentPrice).catch(() => {})
    return () => unsubscribeFromPriceUpdates(symbol, cb)
  }, [selectedPair.symbol])

  // Subscribe to prices for active operations
  useEffect(() => {
    const cbs: Array<[string, (p: number) => void]> = []
    const symbols = new Set(pendingOps.filter(o => o.resultado === "pendente").map(o => o.ativo))

    symbols.forEach((symbol) => {
      const cb = (price: number) => {
        setOperationPrices((prev) => ({ ...prev, [symbol]: price }))
      }
      subscribeToPriceUpdates(symbol, cb)
      cbs.push([symbol, cb])
    })

    return () => { cbs.forEach(([s, cb]) => unsubscribeFromPriceUpdates(s, cb)) }
  }, [pendingOps])

  // Fetch pending operations
  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/operations/pending")
      if (res.ok) {
        const data = await res.json()
        setPendingOps(Array.isArray(data) ? data : [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchPending()
    const interval = setInterval(fetchPending, 3000)
    return () => clearInterval(interval)
  }, [fetchPending])

  // Fetch history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch("/api/operations/history")
      if (res.ok) {
        const data = await res.json()
        setHistoryOps(data.operations || [])
      }
    } catch {}
    setLoadingHistory(false)
  }, [])

  // Place trade
  const placeTrade = async (direction: "call" | "put") => {
    if (!currentPrice || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/operations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "real",
          ativo: selectedPair.symbol,
          tempo: selectedTimeframe,
          previsao: direction,
          vela: selectedTimeframe,
          abertura: currentPrice,
          valor: amount,
        }),
      })
      if (res.ok) {
        fetchPending()
      } else {
        const err = await res.json()
        alert(err.error || "Erro ao criar operação")
      }
    } catch {
      alert("Erro de conexão")
    }
    setSubmitting(false)
  }

  const handleExpired = useCallback((id: string) => {
    setTimeout(fetchPending, 2000)
  }, [fetchPending])

  // Active entry for chart overlay
  const activeEntry = pendingOps.find(
    (o) => o.resultado === "pendente" && o.ativo === selectedPair.symbol
  )

  const activeOps = pendingOps.filter((o) => o.resultado === "pendente")
  const recentResults = pendingOps.filter((o) => o.resultado === "ganho" || o.resultado === "perda")

  return (
    <div className="flex flex-col gap-3" style={{ color: "#e5e7eb" }}>
      {/* Header - Pair selector + Timeframe */}
      <div className="flex flex-wrap items-center gap-2">
        {POPULAR_PAIRS.map((p) => (
          <button
            key={p.symbol}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-medium transition-colors",
              selectedPair.symbol === p.symbol
                ? "bg-[#2962ff] text-white"
                : "bg-[#1e2130] text-gray-400 hover:text-white"
            )}
            onClick={() => setSelectedPair(p)}
          >
            {p.name}
          </button>
        ))}
        <div className="ml-auto flex gap-0.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              className={cn(
                "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                selectedTimeframe === tf
                  ? "bg-[#2962ff] text-white"
                  : "text-gray-500 hover:text-gray-300"
              )}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: Chart + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Chart */}
        <div className="lg:col-span-3">
          <div className="rounded-lg overflow-hidden border border-[#1e222d]" style={{ background: "#131722" }}>
            {/* Chart header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e222d]">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold text-sm">{selectedPair.name}</span>
                {currentPrice !== null && (
                  <span className="text-base font-mono text-white">{formatPrice(currentPrice)}</span>
                )}
              </div>
              <span className="text-[10px] text-gray-600">
                {selectedTimeframe.toUpperCase()} · {selectedPair.type === "crypto" ? "Binance" : "iTick"}
              </span>
            </div>

            {/* Canvas chart */}
            <div className="h-[420px]">
              {loadingCandles && candles.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                </div>
              ) : (
                <CandlestickChart
                  candles={candles}
                  currentPrice={currentPrice}
                  entryPrice={activeEntry?.abertura ?? null}
                  entryDirection={activeEntry?.previsao ?? null}
                  activeOp={activeEntry ?? null}
                />
              )}
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {/* Order panel */}
          <div className="rounded-lg border border-[#1e222d] p-4" style={{ background: "#1e2130" }}>
            <p className="text-xs text-gray-500 mb-3 font-medium">Nova Operação</p>

            {/* Amount */}
            <div className="mb-3">
              <label className="text-[10px] text-gray-600 mb-1 block uppercase tracking-wider">Valor (USD)</label>
              <div className="flex items-center gap-1">
                <button
                  className="h-8 w-8 rounded bg-[#131722] text-gray-400 hover:text-white text-sm font-bold"
                  onClick={() => setAmount(Math.max(10, amount - 50))}
                >−</button>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                  className="h-8 text-center text-sm bg-[#131722] border-[#2a2d37] text-white"
                />
                <button
                  className="h-8 w-8 rounded bg-[#131722] text-gray-400 hover:text-white text-sm font-bold"
                  onClick={() => setAmount(amount + 50)}
                >+</button>
              </div>
            </div>

            {/* Payout info */}
            <div className="text-center text-[11px] text-gray-500 mb-3">
              Receita: <span className="text-[#26a69a] font-medium">${(amount * payoutRate).toFixed(2)}</span>
              <span className="ml-1 text-gray-600">({(payoutRate * 100).toFixed(0)}%)</span>
            </div>

            {/* Buy/Sell buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => placeTrade("call")}
                disabled={submitting || !currentPrice}
                className="h-12 rounded-lg bg-[#26a69a] hover:bg-[#2bbd8e] disabled:opacity-40 text-white font-bold text-sm flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                COMPRA
              </button>
              <button
                onClick={() => placeTrade("put")}
                disabled={submitting || !currentPrice}
                className="h-12 rounded-lg bg-[#ef5350] hover:bg-[#f44336] disabled:opacity-40 text-white font-bold text-sm flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <TrendingDown className="h-4 w-4" />
                VENDA
              </button>
            </div>

            <div className="text-center text-[10px] text-gray-600">
              Expiração: <span className="text-gray-400">{selectedTimeframe}</span>
            </div>
          </div>

          {/* Active Operations */}
          <div className="rounded-lg border border-[#1e222d] p-4" style={{ background: "#1e2130" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                Ativas
                {activeOps.length > 0 && (
                  <span className="bg-[#2962ff] text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{activeOps.length}</span>
                )}
              </p>
            </div>

            {/* Recent results */}
            {recentResults.map((op) => (
              <ActiveOperationCard
                key={op.id}
                operation={op}
                currentPrice={operationPrices[op.ativo] ?? null}
                onExpired={handleExpired}
              />
            ))}
            {/* Active */}
            {activeOps.length === 0 && recentResults.length === 0 ? (
              <div className="text-center py-4">
                <BarChart2 className="h-6 w-6 text-gray-700 mx-auto mb-1" />
                <p className="text-[10px] text-gray-600">Nenhuma operação</p>
              </div>
            ) : (
              activeOps.map((op) => (
                <ActiveOperationCard
                  key={op.id}
                  operation={op}
                  currentPrice={operationPrices[op.ativo] ?? (op.ativo === selectedPair.symbol ? currentPrice : null)}
                  onExpired={handleExpired}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* History toggle */}
      <div className="rounded-lg border border-[#1e222d]" style={{ background: "#1e2130" }}>
        <button
          className="w-full flex items-center justify-between px-4 py-3"
          onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory() }}
        >
          <span className="text-xs font-medium text-gray-400 flex items-center gap-2">
            <History className="h-3.5 w-3.5" />
            Histórico
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-gray-600 transition-transform", showHistory && "rotate-180")} />
        </button>
        {showHistory && (
          <div className="px-4 pb-4">
            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              </div>
            ) : historyOps.length === 0 ? (
              <p className="text-center text-xs text-gray-600 py-6">Sem operações</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2d37] text-left text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                      <th className="pb-2 pr-3">Data</th>
                      <th className="pb-2 pr-3">Ativo</th>
                      <th className="pb-2 pr-3">Dir.</th>
                      <th className="pb-2 pr-3">Valor</th>
                      <th className="pb-2 pr-3">Abertura</th>
                      <th className="pb-2 pr-3">Fechamento</th>
                      <th className="pb-2 pr-3">Receita</th>
                      <th className="pb-2">Res.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2d37]">
                    {historyOps.map((op) => {
                      const isWin = op.resultado === "ganho"
                      const isCall = op.previsao === "call"
                      return (
                        <tr key={op.id} className="text-xs">
                          <td className="py-2.5 pr-3 whitespace-nowrap text-gray-500">
                            {format(new Date(op.data), "dd/MM HH:mm", { locale: ptBR })}
                          </td>
                          <td className="py-2.5 pr-3 font-medium text-gray-300">{op.ativo}</td>
                          <td className="py-2.5 pr-3">
                            <span className={cn("text-[10px]", isCall ? "text-[#26a69a]" : "text-[#ef5350]")}>
                              {isCall ? "▲" : "▼"}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-gray-400">{formatUsd(op.valor)}</td>
                          <td className="py-2.5 pr-3 font-mono text-[10px] text-gray-500">{formatPrice(op.abertura)}</td>
                          <td className="py-2.5 pr-3 font-mono text-[10px] text-gray-500">{op.fechamento ? formatPrice(op.fechamento) : "—"}</td>
                          <td className={cn("py-2.5 pr-3 font-medium", isWin ? "text-[#26a69a]" : "text-[#ef5350]")}>
                            {isWin
                              ? `+${formatUsd(op.receita)}`
                              : `-${formatUsd(op.valor)}`}
                          </td>
                          <td className="py-2.5">
                            {isWin
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-[#26a69a]" />
                              : <XCircle className="h-3.5 w-3.5 text-[#ef5350]" />
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
