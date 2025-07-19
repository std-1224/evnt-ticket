'use client'

import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import QRCodeLib from 'qrcode'

interface QRCodeDisplayProps {
  value: string
  size?: number
  className?: string
  bgColor?: string
  fgColor?: string
}

export function QRCodeDisplay({
  value,
  size = 128,
  className = '',
  bgColor = '#FFFFFF',
  fgColor = '#000000'
}: QRCodeDisplayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-gray-500 text-xs">Loading QR...</div>
      </div>
    )
  }

  return (
    <div className={`inline-block p-2 bg-white rounded-lg ${className}`}>
      <QRCode
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level="M"
      />
    </div>
  )
}

// Utility function to download QR code as image
export async function downloadQRCode(value: string, filename: string = 'qr-code.png') {
  try {
    const url = await QRCodeLib.toDataURL(value, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}
