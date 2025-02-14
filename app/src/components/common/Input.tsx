import Image, { type ImageProps } from "next/image"

import {
  Input as ShadcnInput,
  InputProps as ShadcnInputProps,
} from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InputProps extends ShadcnInputProps {
  leftIcon?: ImageProps["src"]
}

export default function Input(props: InputProps) {
  const { className, leftIcon, ...rest } = props
  return (
    <div
      className={cn([
        "border border-input rounded-md w-full px-3 py-2.5 space-x-2 bg-background flex",
        className,
      ])}
    >
      {leftIcon && (
        <Image src={leftIcon} width={20} height={20} alt="Awards icon" />
      )}
      <ShadcnInput
        className="border-0 bg-inherit w-full h-fit !p-0"
        {...rest}
      />
    </div>
  )
}
