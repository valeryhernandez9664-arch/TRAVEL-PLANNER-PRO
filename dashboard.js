const Dashboard = {
  render() {
    const user = JSON.parse(localStorage.getItem("travel_user"));

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const attractions =
      JSON.parse(localStorage.getItem("favorite_attractions")) || [];

    const history = JSON.parse(localStorage.getItem("history")) || [];

    document.getElementById("dashboard").innerHTML = `

<div class="card">

<h2>${user.name}</h2>

<p>
Países consultados:
${history.length}
</p>

<p>
Favoritos:
${favorites.length}
</p>

<p>
Atracciones:
${attractions.length}
</p>

</div>

`;
  },
};
