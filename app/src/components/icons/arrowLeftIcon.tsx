"use client"
import React from "react"

interface IProps {
  fill?: string
  className?: string
  height?: number
  width?: number
}

const ArrowLeftIcon: React.FC<IProps> = ({
  fill,
  className,
  height,
  width,
}) => {
  return (
    <svg
      className={className}
      width={width ? width : "14"}
      height={height ? height : "13"}
      viewBox="0 0 14 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.52337 5.66609H13.6663V7.33276H3.52337L7.99334 11.8027L6.81484 12.9812L0.333008 6.49943L6.81484 0.0175781L7.99334 1.19609L3.52337 5.66609Z"
        fill={fill ? fill : "#0F111A"}
      />
    </svg>
  )
}

export default ArrowLeftIcon
