"use client"

import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas-lite"

export const Sunny = () => {
    const { rive, RiveComponent } = useRive({
      src: "/assets/images/sunny-animation.riv",
      autoplay: true,
      stateMachines: "State Machine 1", // Adjust based on your .riv file
      layout: new Layout({
        fit: Fit.FitHeight,
        alignment: Alignment.CenterLeft,
      }),
    })

    // Optional: Control animation states for interactivity
    const hoverInput = useStateMachineInput(rive, "State Machine 1", "hover")
    
    return (
      <div className="w-full max-w-[1064px]">
        <div className="w-full h-[120px] relative bg-[#fff0f1] rounded-xl flex items-center overflow-hidden">
          {/* Rive animation container */}
          <div className="absolute left-0 top-0 h-full w-[300px]">
            <RiveComponent
              className="w-full h-full"
              onMouseEnter={() => {
                if (hoverInput) {
                  hoverInput.fire()
                }
              }}
            />
          </div>
          <div className="flex-1 px-10 z-10 ml-[300px]">
            <div className="text-[#b80018] text-base font-semibold leading-normal">
              Not sure? Sunny can help you find the right grant program
            </div>
          </div>
        </div>
      </div>
    )
}