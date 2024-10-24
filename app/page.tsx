import Image from "next/image";
import author from "../public/estebandalelr.jpg";

export default function IndexPage() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="shadow-md flex justify-center items-center flex-col p-4 rounded bg-red-200">
        <Image
          className="rounded-full"
          placeholder="blur"
          alt="picture of esteban"
          width={200} // specify the width of the image
          height={200} // specify the height of the image
          priority // preloads the image
          src={author}
        />
        <h1 className="text-3xl">🤖Esteban Dalel R</h1>
        <h2 className="italic">I make good software and tell bad jokes</h2>
        <div className="w-full flex items-center justify-center underline flex-col space-y-4 py-4">
          <a href="https://twitter.com/EstebanDalelR">Twitter(X?)</a>
          <a href="https://github.com/estebandalelr/">GitHub</a>
          <a href="https://www.linkedin.com/in/estebandalelr/">LinkedIn</a>
          <a href="https://www.youtube.com/@estebandalelr">YouTube</a>
          <a href="https://blog.estebandalelr.co">Read my blog!</a>
        </div>
      </div>
    </div>
  );
}
