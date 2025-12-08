/* CS 463 - Intro Web Development Final Project
 *   Aaron Stave
 *   December 2025
 *
 * Javascript documentation:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
 * GitHub REST API documentation:  https://docs.github.com/en/rest?apiVersion=2022-11-28
 *   (unauthenticated requests have 60 requests per hour limit)
 *   (fetch public repo: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28&versionId=free-pro-team%40latest&restPage=getting-started-with-the-rest-api)
 */

// Ensure DOM is loaded before running scripts
$(document).ready(() => {
  // The best part of this is that you can add more projects to the carousel simply by adding them to this array.
  // 'Owner' lets you pull data from any public repo, not just your own, handy if you use another account or contribute elsewhere.
  // API doesn't have anything suitable for a project blurb, so we have to hardcode those in here.
  const repos = [
    {
      owner: "a-stave",
      name: "ChocAn-Project",
      description:
        "A mock healthcare billing system using MySQL and C++ for managing patient and provider data.",
    },
    {
      owner: "a-stave",
      name: "ms-fs-Logitrack",
      description:
        "An inventory management system built with ASP.NET Core and C# for tracking logistics and supply chain operations.",
    },
    {
      owner: "a-stave",
      name: "ms-fs-mocksite.github.io",
      description: "A sample site for testing HTML, CSS, and JS features.",
    },
  ];

  // Handles form submission by logging input to console and briefly occluding the form with an overlay so users know it worked.
  // One day I might make this actually do something, but 'mailto' seemed too clunky to go through with.
  const submitForm = function submitFormUserInput() {
    const form = $("form");
    const overlay = $(".overlay");

    form.on("submit", function handleSubmit(event) {
      event.preventDefault();
      console.log(form[0].elements.name.value);
      console.log(form[0].elements.email.value);
      console.log(form[0].elements.message.value);

      form[0].reset();

      overlay.css("opacity", "1");
      setTimeout(() => {
        overlay.css("opacity", "0");
      }, 2000);
    });
  };

  // Fetches the latest commit date from a given GitHub repo, limited to 60 requests per hour.
  // Note this does nothing to verify yours was the last commit, so showcasing contributions is out of the question atm.
  function latestCommit(owner, repo) {
    return $.ajax({
      url: `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      method: "GET",
      dataType: "json",
    })
      .then((commits) => {
        if (!Array.isArray(commits) || commits.length === 0) return null;
        return commits[0].commit.committer.date;
      })
      .catch(() => null);
  }

  // Converts a date into human-readable "time ago" format, ranging from minute(s) to year(s).
  // Not sure I like this... More efficient than precomputing all values upfront, and it mimics an if-else
  // chain's short-circuiting behavior so it's as efficient as can be, but cases aren't intuitive...
  function timeAgo(isoDate) {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diffMs / 60000);

    // Uses string interpolation to handle pluralization
    switch (true) {
      // `Minutes ago...`
      case minutes < 60:
        return `Last updated ${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      // `Hours ago...` (60 minutes * 24 hours = 1440)
      case minutes < 1440: {
        const hours = Math.floor(minutes / 60);
        return `Last updated ${hours} hour${hours !== 1 ? "s" : ""} ago`;
      }
      // `Days ago...` (1440 minutes * 7 days = 10080)
      case minutes < 10080: {
        const days = Math.floor(minutes / 1440);
        return `Last updated ${days} day${days !== 1 ? "s" : ""} ago`;
      }
      // `Weeks ago...` (10080 minutes * 4 weeks = 43200)
      case minutes < 43200: {
        const weeks = Math.floor(minutes / 10080);
        return `Last updated ${weeks} week${weeks !== 1 ? "s" : ""} ago`;
      }
      // `Months ago...` (43200 minutes * 12 months = 525600)
      case minutes < 525600: {
        const months = Math.floor(minutes / 43200);
        return `Last updated ${months} month${months !== 1 ? "s" : ""} ago`;
      }
      // `Years ago...` Anything exceeding twelve months (525600 minutes)
      default: {
        const years = Math.floor(minutes / 525600);
        return `Last updated ${years} year${years !== 1 ? "s" : ""} ago`;
      }
    }
  }

  // Builds out the project carousel dynamically from the functions above, the 'repos' array, and API fetches.
  // One major drawback is that the cards are "built" here instead of in HTML, making it harder to tweak styling.
  function buildCarousel() {
    const $carouselInner = $("#carouselExampleIndicators .carousel-inner");

    repos.forEach((repo, index) => {
      const $item = $("<div>")
        .addClass("carousel-item")
        .toggleClass("active", index === 0);

      const $card = $("<div>").addClass("card mb-3");
      const $row = $("<div>").addClass("row g-0");

      // Left column: Project logo or image (click to go to repo)
      // Currently uses GitHub logo as placeholder, can be swapped out for repo-specific images later
      // by adding an 'image' field to each repo object.
      const $colLeft = $("<div>")
        .addClass("col-md-4 d-flex justify-content-center align-items-center")
        .append(
          $("<a>")
            .attr("href", `https://github.com/${repo.owner}/${repo.name}`)
            .attr("target", "_blank")
            .append(
              $("<img>")
                .attr({
                  src: "images/github-mark.svg",
                  alt: "github link",
                })
                .addClass("img-fluid rounded-start")
            )
        );

      // Right column: Project title and description
      const $colRight = $("<div>")
        .addClass("col-md-8 align-items-start")
        .append(
          $("<div>")
            .addClass("card-body")
            .append(
              $("<h3>").addClass("card-title").text(repo.name),
              $("<p>")
                .addClass("card-text project-blurb")
                .text(repo.description)
            )
        );
      $row.append($colLeft, $colRight);
      $card.append($row);
      $item.append($card);
      $carouselInner.append($item);

      // Right column continued: Fetch and append latest commit date
      // Check JSON response for other data you might append here
      latestCommit(repo.owner, repo.name).then((commitDate) => {
        const text = commitDate
          ? `<small class="text-muted">${timeAgo(commitDate)}</small>`
          : `<small class="text-muted">Could not fetch update time</small>`;
        $("<p>")
          .addClass("card-text")
          .html(text)
          .appendTo($colRight.find(".card-body"));
      });
    });
  }

  // After all that, we can finally call our functions...
  buildCarousel();
  submitForm();
});
