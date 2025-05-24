import Image from "next/image"

export const HomeHeader = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 md:gap-0">
        <Image
          src="/assets/images/sunny-home-header.svg"
          alt="Sunny"
          width={505} // 532px in design
          height={228} // 240px in design
          className="order-first md:order-last"
        />
        <div className="flex flex-col gap-16 items-center md:items-start">
          <Image
            src="/assets/images/op-logo.svg"
            alt="Grants for the Superchain Ecosystem"
            width={80}
            height={80}
            className="hidden md:block"
          />
          <div className="font-semibold flex flex-col gap-1 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl">Grants for the</h1>
            <h1 className="text-2xl md:text-4xl">Superchain Ecosystem</h1>
          </div>
        </div>
      </div>
      <div className="text-sm text-center text-white bg-gradient-to-r from-brand-primary md:from-35% via-orange-500 md:via-75% to-text-destructive rounded-lg p-3">
        Optimism has rewarded 500+ builders with <strong>60,815,042 OP</strong>{" "}
        since 2022
      </div>
    </div>
  )
}
