import React from "react"
import type { ReactNode } from "react"

type ContainerProps = {
  children: ReactNode
}

const Container: React.FC<ContainerProps> = ({ children }) => (
  <div className="relative ">
    <div className="z-10 mx-auto ">{children}</div>
    <div
      className="absolute h-dvh w-screen bg-cover bg-center blur transition-opacity  duration-300"
      style={{ backgroundImage: "url('/images/bg1.jpg')" }}
    />
  </div>
)

export default Container
