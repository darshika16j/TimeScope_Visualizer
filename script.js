document.getElementById("searchButton").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();

  if (query) {
    fetchData(query);
  }
});

function fetchData(query) {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`;

  fetch(endpoint)
    .then((response) => response.json())
    .then((data) => {
      const searchResults = data.query.search;
      const titles = searchResults.map((result) => result.title);

      fetchImages(titles).then((images) => {
        renderTimeline(searchResults, images);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function fetchImages(titles) {
  const titleParam = titles.map((title) => encodeURIComponent(title)).join('|');
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&titles=${titleParam}&prop=pageimages&format=json&pithumbsize=200&origin=*`;

  return fetch(endpoint)
    .then((response) => response.json())
    .then((data) => {
      const pages = data.query.pages;
      const images = {};

      Object.values(pages).forEach((page) => {
        images[page.title] = page.thumbnail ? page.thumbnail.source : null;
      });

      return images;
    })
    .catch((error) => {
      console.error("Error fetching images:", error);
      return {};
    });
}

function renderTimeline(events, images) {
  const timeline = document.querySelector(".timeline");
  timeline.innerHTML = "";

  events.forEach((event, index) => {
    const eventCard = document.createElement("a"); 
    eventCard.className = `event ${index === 0 ? "active" : ""}`;
    eventCard.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(event.title)}`;
    eventCard.target = "_blank"; 
    eventCard.rel = "noopener noreferrer"; 

    const imageUrl = images[event.title];
    const imageContent = imageUrl
      ? `<img src="${imageUrl}" alt="${event.title}">`
      : `<div class="no-image">No Image Available</div>`;

    eventCard.innerHTML = `
      ${imageContent}
      <h3>${event.title}</h3>
      <p>${event.snippet}</p>
    `;

    timeline.appendChild(eventCard);
  });
}
