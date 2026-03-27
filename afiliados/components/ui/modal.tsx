"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Propriedades do Modal
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Fechar o modal quando clicar no botão (não mais fora do modal)
  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
      <div
        ref={modalRef}
        className="relative bg-white p-6 rounded-lg max-w-lg w-full shadow-lg animate-fade-in-up"
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
