$(document).ready(() => {
  // To add more projects to the site simply add them to this array. This hopefully makes it easier to add to the
  // project carousel and even lets us use different accounts if we ever abandon our current GitHub account.
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

  function latestCommit(owner, repo) {
    return $.ajax({
      //url: `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      method: "GET",
      dataType: "json",
    })
      .then((commits) => {
        if (!Array.isArray(commits) || commits.length === 0) return null;
        return commits[0].commit.committer.date;
      })
      .catch(() => null);
  }
  // function timeAgo(isoDate) {
  //   const diffMs = Date.now() - new Date(isoDate).getTime();
  //   const minutes = Math.floor(diffMs / 60000);
  //   if (minutes < 60)
  //     return `Last updated ${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  //   const hours = Math.floor(minutes / 60);
  //   if (hours < 24)
  //     return `Last updated ${hours} hour${hours !== 1 ? "s" : ""} ago`;
  //   const days = Math.floor(hours / 24);
  //   if (days < 7)
  //     return `Last updated ${days} day${days !== 1 ? "s" : ""} ago`;
  //   const weeks = Math.floor(days / 7);
  //   if (weeks < 4)
  //     return `Last updated ${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  //   const months = Math.floor(weeks / 4);
  //   if (months < 12)
  //     return `Last updated ${months} month${months !== 1 ? "s" : ""} ago`;
  //   const years = Math.floor(months / 12);
  //     return `Last updated ${years} year${years !== 1 ? "s" : ""} ago`;
  // }

  // Not sure I like this... It's more efficient than precomputing values upfront and also mimics the
  // short-circuiting behavior of the if-else chain above, but cases aren't as simple as they could be...
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

  function buildCarousel() {
    const $carouselInner = $("#carouselExampleIndicators .carousel-inner");

    repos.forEach((repo, index) => {
      const $item = $("<div>")
        .addClass("carousel-item")
        .toggleClass("active", index === 0);

      const $card = $("<div>")
        .addClass("card mb-3 h-100")
        .css("max-width", "540px");
      const $row = $("<div>").addClass("row g-0 h-100");

      // Left column: GitHub logo link
      const $colLeft = $("<div>")
        .addClass("col-md-4 d-flex justify-content-center align-items-center")
        .append(
          $("<a>")
            .attr("href", `https://github.com/${repo.owner}/${repo.name}`)
            .attr("target", "_blank")
            .append(
              $("<img>")
                .attr({
                  src: "src/github-mark.svg",
                  alt: "github link",
                })
                .css({ width: "120px", height: "auto" })
                .addClass("img-fluid rounded-start")
            )
        );

      // Right column: card body
      const $colRight = $("<div>")
        .addClass("col-md-8")
        .append(
          $("<div>")
            .addClass("card-body")
            .append(
              $("<h3>").addClass("card-title").text(repo.title),
              $("<p>")
                .addClass("card-text project-blurb")
                .text(repo.description)
            )
        );

      $row.append($colLeft, $colRight);
      $card.append($row);
      $item.append($card);
      $carouselInner.append($item);

      // Fetch commit date and append footer
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

  buildCarousel();

  // function updateCards() {
  //   $("#projects .card").each(function () {
  //     const $card = $(this);
  //     const $link = $card.find('a[href*="github.com"]');
  //     if ($link.length === 0) return;

  //     // Extract repo from the href
  //     const match = $link.attr("href").match(/github\.com\/([^/]+)\/([^/]+)/);
  //     if (!match) return;
  //     const [, owner, repo] = match;

  //     const $body = $card.find(".card-body");

  //     latestCommit(owner, repo).then(function (commitDate) {
  //       const text = commitDate
  //         ? `<small class="text-muted">${timeAgo(commitDate)}</small>`
  //         : `<small class="text-muted">Could not fetch update time</small>`;

  //       $("<p>").addClass("card-text").html(text).appendTo($body);
  //     });
  //   });
  // }

  // updateCards();
});
