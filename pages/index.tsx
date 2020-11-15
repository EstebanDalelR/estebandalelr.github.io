
export default function IndexPage() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="shadow-md flex justify-center items-center flex-col p-4 rounded">
        <h1 className="text-3xl">Esteban Dalel R</h1>
        <h2 className="italic">I make good software and tell bad jokes</h2>
        <p>Find me on:</p>
        <div className="w-full flex flex-wrap justify-around">
          <a href="https://twitter.com/EstebanDalelR">Twitter</a>
          <a href="https://github.com/estebandalelr/">Github</a>
          <a href="https://www.linkedin.com/in/estebandalelr/">LinkedIn</a>
        </div>
      </div>
    </div>
  )
}