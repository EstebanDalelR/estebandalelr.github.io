import ga from "../data/ga.json";
export default function GithubAchievements() {
  return (
    <div>
      <h1>Github Achievements</h1>
      <p>
        A compilation of <a href='https://github.blog/2022-06-09-introducing-achievements-recognizing-the-many-stages-of-a-developers-coding-journey/'>GitHub Achievements</a>
      </p>
      {ga.map((achievement) => {
        (
          <div>
            <h2>{achievement.name}</h2>
            <p>{achievement.description}</p>
            <img src={achievement.image} alt={achievement.name} />
          </div>
        )
      })}
    </div>
  );
}