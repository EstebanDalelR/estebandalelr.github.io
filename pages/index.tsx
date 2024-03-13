import Image from "next/image"
import author from "../public/estebandalelr.jpg"

export default function IndexPage() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="shadow-md flex justify-center items-center flex-col p-4 rounded bg-red-200">
        <Image
          className="rounded-full"
          placeholder="blur"
          alt="picture of esteban"
          src={author} />
        <h1 className="text-3xl">Esteban Dalel R</h1>
        <h2 className="italic">I make good software and tell bad jokes</h2>
        <h3 className="italic">Engineer at <a href="https://astronuts.io">Astronuts</a></h3>
        <p>Find me on:</p>
        <div className="w-full flex flex-wrap justify-around">
          <a href="https://twitter.com/EstebanDalelR">Twitter</a>
          <a href="https://github.com/estebandalelr/">GitHub</a>
          <a href="https://www.linkedin.com/in/estebandalelr/">LinkedIn</a>
          <a href="https://www.youtube.com/@estebandalelr">YouTube</a>
        </div>
        <p>
          <a href="https://blog.estebandalelr.co">
            Read my blog!
          </a>
        </p>
      </div>
    </div>
  )
}
