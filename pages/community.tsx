const Community = () => {
  return (
    <>
      <html lang="en">
        <head>
          <meta />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>The Hangar - DX community</title>

          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/images/favicon.png"
          />

          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
            integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
            crossOrigin="anonymous"
          />

          <link rel="stylesheet" href="/simple.css" />
          <meta
            property="og:image"
            content="https://dx.community/images/hangar.png"
          />
          <meta property="og:title" content="The Hangar" />
          <meta
            property="og:description"
            content="A community of DX enthusiasts."
          />
        </head>
        <body>
          <div className="container">
            <div className="jumbo-header mt-4 py-4">
              <img src="images/hangar.svg" />
              <h1>The Hangar</h1>
              <p className="lead">
                A curated community for developer-experience (DX) enthusiasts
              </p>
            </div>

            <h2 className="mt-4">
              Elevate your craft &mdash; learn, share and collaborate on topics
              related to developer productivity
            </h2>

            <div className="mt-5 text-center">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScHADjbCJmnrObldibEjS6c3bUSzkzJzSa8qkgthONnEKM1AA/viewform"
                className="btn btn-dark btn-lg px-5"
              >
                Join us
              </a>
            </div>
            <h3 className="mt-5">Who we are</h3>
            <p>
              The Hangar is a community of senior devops and senior software
              engineers focused on developer experience. This is a space where
              vetted experienced professionals can exchange ideas, share
              hard-earned wisdom, troubleshoot issues, and ultimately help each
              other in their projects and careers.
            </p>
            <p>
              We invite developers who work in DX and platform teams at their
              respective companies, or who are interested in developer
              productivity.
            </p>

            <h3 className="mt-5">Off-the-record hangouts</h3>
            <p>
              Join our off-the-record virtual meetups for honest thoughts and
              discussions, while also learning from peers about challenges that
              they've solved at their organizations. Stay up-to-date with best
              practices, useful tools, relevant industry news and career tips.
            </p>

            <h4>Upcoming events</h4>
            <ul>
              <blockquote className="twitter-tweet">
                <p lang="en" dir="ltr">
                  In the upcoming Hangar DX session, we are chatting with
                  <a href="https://twitter.com/KentBeck?ref_src=twsrc%5Etfw">
                    @KentBeck
                  </a>
                  ! We will dive into evolution of software development
                  methodologies, test driven development, the role of AI in
                  software development.
                  <br />
                  <br />
                  When: Friday, Apr 5th 10am PDT | 1pm EDT
                  <br />
                  Where:
                  <a href="https://t.co/RUhZCil8VO">https://t.co/RUhZCil8VO</a>
                  <a href="https://t.co/Ujt34g7rik">
                    pic.twitter.com/Ujt34g7rik
                  </a>
                </p>
                &mdash; Aviator.Co (@Aviator_co_)
                <a href="https://twitter.com/Aviator_co_/status/1773035432680333464?ref_src=twsrc%5Etfw">
                  March 27, 2024
                </a>
              </blockquote>
              <script
                async
                src="https://platform.twitter.com/widgets.js"
                charSet="utf-8"
              ></script>
            </ul>

            <h4>Past events</h4>
            <ul>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1768391121342734358?s=20">
                  March 22, 2024
                </a>
                - Enabling a "You Build, You Manage Culture" with Sam Gorial,
                LaunchDarkly
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1757538119673667654?s=20">
                  Feb 16, 2024
                </a>
                - Services bootstrapping framework with Javier Garcia, Docker
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1747336547681333575?s=20">
                  Jan 26, 2024
                </a>
                - Developer Productivity and Happiness framework with Max
                Kanat-Alexander, LinkedIn
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1729228187073462622?s=20">
                  Dec 7, 2023
                </a>
                - AMA with Ian Nowland, Ex-SVP Core Engineering, Datadog
              </li>
              <li>
                <a href="https://x.com/Aviator_co_/status/1725222710630859222?s=20">
                  Nov 16, 2023
                </a>
                - AMA with Tara Hernandez, VP Developer Productivity, MongoDB
              </li>
              <li>
                <a href="https://x.com/Aviator_co_/status/1712250683909718099?s=20">
                  Oct 20, 2023
                </a>
                - Manage 1000s of multi-repos at LinkedIn scale, Max
                Kanat-Alexander, LinkedIn
              </li>
              <li>
                <a href="https://x.com/Aviator_co_/status/1696536904404250771?s=20">
                  Sept 28, 2023
                </a>
                - AMA with Laurie Darcey and Eric Kuck, Mobile DevEx Leads at
                Reddit
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1683995463203291136?s=20">
                  Aug 3, 2023
                </a>
                - AMA with Scott MacVicar, Head of DevEx at Stripe
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1676995680722616324?s=20">
                  Jul 20, 2023
                </a>
                - AMA with Keith Pitt, CEO of Buildkite
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1669429524008673280?s=20">
                  Jun 29, 2023
                </a>
                - Balancing the Value and Cost of Observability with Gusto
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1661070867453886465?s=20">
                  May 25, 2023
                </a>
                - Internal engineering productivity with Elastic
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1650557831978835980?s=20">
                  Apr 27, 2023
                </a>
                - Dos and donts of internal dev platform with Amplitude and
                Pinterest
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1638188935514824706?s=20">
                  Mar 24, 2023
                </a>
                - Reducing CI time and costs at Cruise with Amy Weiner
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1628081909023617024?s=20">
                  Feb 24, 2023
                </a>
                - The evolution of DX at Slack with Sridhar Ramakrishnan
              </li>
              <li>
                <a href="https://twitter.com/Aviator_co_/status/1613300589881868291?s=20">
                  Jan 18, 2023
                </a>
                - Improving Netflix's internal dev-platform with Nadeem Ahmad
              </li>
            </ul>

            <h3 className="mt-5">Slack community</h3>
            <p>
              A place to ask questions, share tips, and get help from fellow
              senior engineers.
            </p>

            <h3 className="mt-5">How to join</h3>
            <p>
              Sign up on this
              <a href="https://docs.google.com/forms/d/e/1FAIpQLScHADjbCJmnrObldibEjS6c3bUSzkzJzSa8qkgthONnEKM1AA/viewform">
                Google Form
              </a>
              for an invite to join the community.
            </p>

            <h3 className="mt-5">Members include</h3>
            <div className="row flex-grid supporters">
              <div className="col">
                <a href="https://aviator.co/">
                  <img src="./images/aviator.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://square.com/">
                  <img src="./images/square.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://slack.com/">
                  <img src="./images/slack.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://netflix.com/">
                  <img src="./images/netflix.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://figma.com/">
                  <img src="./images/figma.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://pinterest.com/">
                  <img src="./images/pinterest.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://getcruise.com/">
                  <img src="./images/cruise.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://benchling.com/">
                  <img src="./images/benchling.jpeg" />
                </a>
              </div>
              <div className="col">
                <a href="https://redhat.com/">
                  <img src="./images/redhat.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://affirm.com/">
                  <img src="./images/affirm.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://reforge.com/">
                  <img src="./images/reforge.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://color.com/">
                  <img src="./images/color.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://secureframe.com/">
                  <img src="./images/secureframe.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://doordash.com/">
                  <img src="./images/doordash.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://amplitude.com">
                  <img src="./images/amplitude.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://reddit.com">
                  <img src="./images/reddit.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://zillow.com">
                  <img src="./images/zillow.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://discord.com">
                  <img src="./images/discord.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://docker.com">
                  <img src="./images/docker.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://elastic.co">
                  <img src="./images/elastic.png" />
                </a>
              </div>
              <div className="col">
                <a href="https://gusto.com">
                  <img src="./images/gusto.png" />
                </a>
              </div>
            </div>

            <hr />
            <h3 className="mt-5">Community Code of Conduct</h3>
            <p>
              This page outlines Hangar DX community's code of conduct
              guidelines and reporting practices. This community is owned and
              operated by Aviator.co.
            </p>
            <p>
              <strong>Shared Values:</strong>
            </p>
            <ul>
              <li>We are a large group of engaged DX professionals</li>
              <li>We encourage each other's learning and growth</li>
              <li>We uphold confidentiality and respect for members</li>
            </ul>
            <br />
            <p>
              <strong>What we are not:</strong>
            </p>
            <ul>
              <li>A group that wants to be sold to by outside vendors</li>
              <li>A place to recruit employees or investment</li>
            </ul>
            <br />
            <p>
              <strong>Code of Conduct Reporting:</strong>
            </p>
            <p>
              Hangar DX Community is an exclusive group of Senior Dev Ops, Site
              Reliability and Developer Productivity engineers to come together
              and share their expertise from leading companies.
            </p>
            <br />
            <p>
              We do not tolerate any form of harassment towards community
              members. Please report any unwelcome behavior to
              thehangar@dx.community email or DM @Visha, our community manager
              if you feel comfortable.
            </p>
            <br />
            <p>
              <strong>Guidelines:</strong>
            </p>
            <p>To be in our community you must:</p>
            <ol>
              <li>
                Use respectful language, we do not tolerate discriminatory jokes
                or explicit behavior
              </li>
              <li>
                Protect member identities, comments, and discussions in Slack
                and in live events held on zoom or in-person. We host our events
                "off-the-record" to encourage open dialogue between peers
              </li>
              <li>No solicitation of data</li>
              <li>
                No offers or asks of community members for sales pitches,
                investment, career roles or advertisement
              </li>
            </ol>
            <br />
            <p>
              Please note Aviator reserves the right to share product updates
              and team milestones when relevant with the DX community as a few
              members are also Aviator customers. We encourage questions and
              active participation during off-the-record chats. Our members are
              part of impactful companies and have an opportunity to share their
              unique experiences with each other.
            </p>
            <p>
              This community would not be possible without your feedback, please
              send any questions to thehangar@dx.community, thank you!
            </p>
            <hr />

            <footer className="footer-dark text-center">
              <p>
                The community is managed by{" "}
                <a href="https://aviator.co">Aviator</a> - a developer
                productivity platform.
              </p>
              <p className="mt-2">Aviator &copy;2023. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    </>
  );
};

export default Community;
