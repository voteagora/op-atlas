import Image from "next/image"

interface HeaderProps {
  thumbnail: string | null
  banner: string | null
}

export default function Header({ thumbnail, banner }: HeaderProps) {
  console.log(thumbnail, banner)
  return (
    <div className="w-full relative">
      {banner && (
        <Image
          src={banner}
          layout="responsive"
          width={1920}
          height={400}
          objectFit="cover"
          alt="Project banner"
          className="rounded-3xl"
        />
      )}
      {/* TODO: Figure out a way to clip bottom right and top left parts of the banner */}
      {thumbnail && (
        <div className="absolute bottom-0 left-0 bg-background pr-10 pt-10 z-50 rounded-tr-3xl">
          <div className="w-28 aspect-square rounded-3xl overflow-hidden">
            <Image
              src={thumbnail}
              layout="responsive"
              width={112}
              height={112}
              objectFit="cover"
              alt="Project thumbnail"
            />
          </div>
        </div>
      )}
    </div>
  )
}
