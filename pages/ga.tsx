import ga from "../data/ga.json";
export default function GithubAchievements() {
  return (
    <div className="prose lg:prose-xl px-4">
      <h1>Github Achievements</h1>
      <p>
        A compilation of <a href='https://github.blog/2022-06-09-introducing-achievements-recognizing-the-many-stages-of-a-developers-coding-journey/'>GitHub Achievements</a>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ga.map((achievement) => {
          return (
            <div className="border-2 border-slate-100 border-solid rounded px-2">
              <h2 className="my-2">{achievement.name}</h2>
              <p>{achievement.description}</p>
              <img src={achievement.image} alt={achievement.name} className="my-2" />
            </div>
          )
        })}
      </div>
    </div>
  );
}