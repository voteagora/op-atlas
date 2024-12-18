"use client"

import React from "react"

interface IProps {
  fill?: string
  className?: string
}

const CheckIconRed: React.FC<IProps> = ({ fill, className }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill={fill || "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM9.0026 14L16.0737 6.92893L14.6595 5.51472L9.0026 11.1716L6.17421 8.3431L4.75999 9.7574L9.0026 14Z"
        fill={fill || "#FF0420"}
      />
    </svg>
  )
}

export default CheckIconRed
