import Image from "next/image"

export const HomeHeader = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row justify-between items-end">
        <div className="flex flex-col gap-16">
          <Image
            src="/assets/images/op-logo.svg"
            alt="Grants for the Superchain Ecosystem"
            width={80}
            height={80}
          />
          <div className="text-4xl font-semibold flex flex-col gap-1">
            <h1>Grants for the</h1>
            <h1>Superchain Ecosystem</h1>
          </div>
        </div>
        <Image
          src="/assets/images/sunny-home-header.svg"
          alt="Sunny"
          width={505} // 532px in design
          height={228} // 240px in design
        />
      </div>
      <div className="text-sm text-center text-white bg-gradient-to-r from-brand-primary from-350% via-orange-500 via-75% to-text-destructive rounded-lg p-3">
        Optimism has rewarded <strong>500+</strong> builders with{" "}
        <strong>60,815,042 OP</strong> since 2022
      </div>
    </div>
  )
}
