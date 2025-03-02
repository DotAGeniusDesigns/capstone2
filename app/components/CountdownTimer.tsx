"use client"

import React from "react"

interface CountdownTimerProps {
  targetDate: string
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  })

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isPast: false,
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.isPast) {
    return <div className="text-sm font-medium text-amber-600">Released!</div>
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="bg-gray-50 rounded-md p-2 text-center min-w-[60px]">
        <div className="text-base font-semibold">{timeLeft.days}</div>
        <div className="text-xs uppercase text-gray-500">Days</div>
      </div>
      <div className="bg-gray-50 rounded-md p-2 text-center min-w-[60px]">
        <div className="text-base font-semibold">{timeLeft.hours}</div>
        <div className="text-xs uppercase text-gray-500">Hours</div>
      </div>
      <div className="bg-gray-50 rounded-md p-2 text-center min-w-[60px]">
        <div className="text-base font-semibold">{timeLeft.minutes}</div>
        <div className="text-xs uppercase text-gray-500">Min</div>
      </div>
      <div className="bg-gray-50 rounded-md p-2 text-center min-w-[60px]">
        <div className="text-base font-semibold">{timeLeft.seconds}</div>
        <div className="text-xs uppercase text-gray-500">Sec</div>
      </div>
    </div>
  )
}

