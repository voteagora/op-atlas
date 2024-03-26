"use client"
import { useSignIn } from "@farcaster/auth-kit"

const Header = () => {
  const res = useSignIn({
    onSuccess: ({ fid }) => console.log("Your fid:", fid),
  })

  console.log("res: ", res)

  return (
    <div id="header" className="flex items-center justify-between w-full p-4">
      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-3 text-white bg-black">
          <button onClick={res.connect}>Sign In</button>
        </div>
      </div>
    </div>
  )
}

export default Header
