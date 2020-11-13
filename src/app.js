import regeneratorRuntime from "regenerator-runtime";
import { graphql } from "@octokit/graphql";
const initial = document.querySelector("[js-change-text]");
const repos = document.querySelector("[js-repo-data]");
const profileBio = document.querySelector("[js-profile-data]");
const aviSmall = document.querySelector(".c-header-avi");

// Change repo nav item text on smaller screens
const changeText = () => {
  if (window.innerWidth < 1000) {
    initial.textContent = "Pulls";
  } else {
    initial.textContent = "Pull requests";
  }
};
changeText();
window.addEventListener("resize", changeText);

/**
 * @function loadData - fetch data from GitHub GraphQL API
 * @returns {repositories, status, avatarUrl, bio, login, name} - destructured data from the fetch response
 */
const loadData = async () => {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${process.env.secretkey}`,
    },
  });
  const { viewer } = await graphqlWithAuth(
    `
      {
        viewer {
          login
          name
          avatarUrl
          bio
          status {
            emojiHTML
          }
          repositories(
            first: 20
            privacy: PUBLIC
            orderBy: { field: UPDATED_AT, direction: DESC }
          ) {
            totalCount
            nodes {
              name
              url
              description
              forkCount
              updatedAt
              stargazers {
                totalCount
              }
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    `
  );

  const { repositories, status, avatarUrl, bio, login, name } = viewer;

  return { repositories, status, avatarUrl, bio, login, name };
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "April",
  "May",
  "June",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const loadBio = async () => {
  const { status, avatarUrl, bio, login, name } = await loadData();
  aviSmall.setAttribute(
    "style",
    `background: url(${avatarUrl}); background-size: cover`
  );
  const html = `
  <div class="c-avi-name">
        <div class="c-profile__avi">
          <img src=${avatarUrl} alt="avatar">
          <div class="hide-mobile c-status">
            ${status.emojiHTML}
          </div> 
        </div>
        
        <div class="c-details">
                <div class="c-details__name">${name}</div>
                <div class="c-details__user">${login}</div>
          </div>
  </div>

        <div class="flex-start c-edit show-mobile-flex">
          <span>
            ${status.emojiHTML} 
          </span> 
          <span class="c-edit__title">Edit Status</span>
        </div>

        <div class="c-bio">
          ${bio}
        </div>
  `;
  profileBio.innerHTML = html;
};

const loadRepos = async () => {
  const { repositories } = await loadData();
  const { nodes, totalCount } = repositories;
  console.log(nodes);
  let html = `<div class="c-repos__number"><b>${totalCount}</b> results for <b>public</b> repositories</div>`;
  nodes.forEach(
    ({
      name,
      description,
      primaryLanguage,
      stargazers,
      url,
      forkCount,
      updatedAt,
    }) => {
      const dateString = updatedAt.split("T")[0].split("-").map(Number);
      const childNode = `<div class="c-repo">
    <div class="c-repo__top">
      <div class="c-repo__details">
        <a href=${url} rel="noreferrer noopener" target="_blank" class="c-repo__name">${name}
        </a>
      </div>
      <div class="c-repo__star">
        <span class="star-icon">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd"
              d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z" />
          </svg>
        </span>
        <span>Star</span>
      </div>
    </div>

    <div class="c-repo__bottom">
      ${
        description
          ? `<div class="c-desc"></div> ${description}
      </div>`
          : ""
      }
      <div class="c-sub">
        <div class="c-sub__code" style="--color: ${
          primaryLanguage ? `${primaryLanguage.color}` : "none"
        }">
          ${primaryLanguage ? `${primaryLanguage.name}` : "empty"}
        </div>
        ${
          stargazers.totalCount > 0
            ? `<div class="c-sub__star">
          <span class="c-sub__icon">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd"
                d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z" />
            </svg>
          </span>
          <span>${stargazers.totalCount}</span>
        </div>`
            : ""
        }

        ${
          forkCount > 0
            ? `<div class="c-sub__star forks">
          <span class="c-sub__icon">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
            </svg>
          </span>
          <span>${forkCount}</span>
        </div>`
            : ""
        }

        <div class="c-sub__updated">${`Updated on ${dateString[2]} ${
          months[dateString[1] - 1]
        }`}</div>
      </div>
    </div>
  </div>
  `;
      html += childNode;
    }
  );
  repos.innerHTML = html;
};

loadRepos();
loadBio();
