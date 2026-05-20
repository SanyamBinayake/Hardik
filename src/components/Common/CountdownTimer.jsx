import React, { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'

const CountdownTimer = ({ endsAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endsAt) - +new Date()
      if (difference <= 0) {
        if (onExpire) onExpire()
        return 'Offer Ended'
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      const pad = (num) => String(num).padStart(2, '0')
      return `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const formatted = calculateTimeLeft()
      setTimeLeft(formatted)
      if (formatted === 'Offer Ended') {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endsAt, onExpire])

  return (
    <div className="inline-flex items-center space-x-2 bg-rose-500/20 backdrop-blur-md text-rose-355 text-rose-200 border border-rose-500/30 px-4 py-2 rounded-2xl font-black text-sm tracking-wider uppercase">
      <Timer className="w-4 h-4 animate-pulse" />
      <span>Ends in: {timeLeft}</span>
    </div>
  )
}

export default CountdownTimer
