import Image from "next/image"
export default function IndexPage() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="shadow-md flex justify-center items-center flex-col p-4 rounded bg-green-100">
        <Image className="rounded-full" src="/esteban.jfif" width={200} height={200} />
        <h1 className="text-3xl">Esteban Dalel R</h1>
        <h2 className="italic">I make good software and tell bad jokes</h2>
        <p>Find me on:</p>
        <div className="w-full flex flex-wrap justify-around">
          <a href="https://twitter.com/EstebanDalelR">Twitter</a>
          <a href="https://github.com/estebandalelr/">Github</a>
          <a href="https://www.linkedin.com/in/estebandalelr/">LinkedIn</a>
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