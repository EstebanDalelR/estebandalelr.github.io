import ga from "../data/ga.json";
export default function GithubAchievements() {
  return (
    <main className="container w-screen flex flex-col justify-center items-center">
    <div className="prose w-full px-4">
      <h1 className="my-3 ">Github Achievements</h1>
      <p>
        A compilation of <a href='https://github.blog/2022-06-09-introducing-achievements-recognizing-the-many-stages-of-a-developers-coding-journey/'>GitHub Achievements</a>
      </p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {ga.map((achievement) => {
          return (
            <div className="border-2 border-slate-100 border-solid rounded px-2 max-w-md flex flex-col justify-start items-start">
              <h2 className="my-2">{achievement.name}</h2>
              <p>{achievement.description}</p>
              <img src={achievement.image} alt={achievement.name} className="my-2 justify-self-end" />
            </div>
          )
        })}
      </div>
    </div>
    <footer>Made by Esteban Dalel R.  <a href="https://github.com/estebandalelr/estebandalelr.github.io">Contribute on GitHub</a></footer>
    </main>
  );
}