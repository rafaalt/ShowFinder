const apiKey = "fc535d51c073ba114e04ff261a9b6350";
const imgApi = "https://image.tmdb.org/t/p/w1280";
const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=pt-BR&query=`;
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");

let page = 1;
let isSearching = false;
let isShowingDetails = false;

// Fetch JSON data from url
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        return await response.json();
    } catch (error) {
        return null;
    }
}

async function fetchDetails(url, type){
    const data = await fetchData(url);
    if (data) {
        if(type === 'tv')
            showDetailsSerie(data);
        if(type === 'movie')
            showDetailsMovie(data);
    }
}

// Fetch and show results based on url
async function fetchAndShowResult(url) {
    const data = await fetchData(url);
    if (data && data.results) {
        showResults(data.results);
    }
}

// Create movie card html template
function createMovieCard(movie) {
    const { poster_path, title, release_date, overview, name, first_air_date, id, media_type} = movie;
    const imagePath = poster_path ? imgApi + poster_path : "./null.png";
    const tvTitle = title || name;
    const truncatedTitle = tvTitle.length > 15 ? tvTitle.slice(0, 15) + "..." : tvTitle;
    let dataFormatada = "No release date"
    const truncatedData = release_date || first_air_date;
    if(truncatedData){
    dataFormatada = dataFormatter(truncatedData);
    }
    let media = media_type === 'tv' ? 'Tv Series' : media_type;
    media = media === 'movie' ? 'Movie' : media;
    media = media === 'person' ? 'Person' : media;
    const cardTemplate = `
        <div class="column">
            <div class="card" onclick="clickCard(${id},'${media_type}')">
                <a class="card-media">
                    <img src="${imagePath}" alt="${title}" width="100%" />
                </a>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left-content">
                        <h3 style="font-weight: 600">${truncatedTitle}</h3>
                        <span style="color: #12efec">${media}</span>
                        </div>
                </div>
                <div class="info">
                    ${overview || "No overview yet..."}
                </div>
            </div>
        </div>
    </div>
    `;
    return cardTemplate;
}

// Clear result element for search
function clearResults() {
    result.innerHTML = "";
}

// Show results in page
function showResults(item) {
    const newContent = item.map(createMovieCard).join("");
    result.innerHTML += newContent || "<p>No results found.</p>";
    result.addEventListener("click", capturarPosicaoMouse);
}
// Load more results
async function loadMoreResults() {
    if (isSearching) {
        return;
    }
    page++;
    const searchTerm = query.value;
    const url = searchTerm ? `${searchUrl}${searchTerm}&page=${page}` : `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=pt-BR&query=${randomLetter()}&page=${page}`;
    await fetchAndShowResult(url);
}

// Detect end of page and load more results
function detectEnd() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
        loadMoreResults();
    }
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = query.value.trim();
    if (searchTerm) {
        isSearching = true;
        clearResults();
        const newUrl = `${searchUrl}${searchTerm}&page=${page}`;
        await fetchAndShowResult(newUrl);
        query.value = "";
    }
}

// Event listeners
form.addEventListener('submit', handleSearch);
window.addEventListener('scroll', detectEnd);
window.addEventListener('resize', detectEnd);

// Initialize the page
async function init() {
    clearResults();
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=pt-BR&query=${randomLetter()}`;
    isSearching = false;
    await fetchAndShowResult(url);
}

function showDetailsSerie(show){
    
    const { first_air_date, genres, last_air_date, name, number_of_episodes, episode_run_time, number_of_seasons, overview, poster_path, in_production} = show;
    // Criar uma nova div
    const firstDate = first_air_date || 'Sem data de lançamento';
    const truncatedOverview = overview.length > 644 ? overview.slice(0,644) + '...' : overview;
    const imagePath = poster_path ? imgApi + poster_path : "./null.png";
    let lastDate;
    let average = "";
    let genreNames = ""
    for (let i = 0; i < genres.length; i++) {
        genreNames += genres[i].name;
        genreNames += ', ';
    }
    if(!in_production){
        if(last_air_date)
            lastDate = `End: ${dataFormatter(last_air_date)}`
        else
            lastDate = 'Sem data de término';
    }
    else{
        lastDate = 'In production'
    }
    if(episode_run_time.length > 0){
        average = `Average: ${episode_run_time}min`
    }
    // Anexar a nova div ao corpo do documento
    details = document.getElementById('details');
    details.innerHTML = `
    <p class="details-btn" onclick="hideDetails()">X</p>
    <img class="details-img" src=${imagePath} height="100%">
    <div class="cabecalho">
        <h1 class="title">${name}</h1>
        <p class="genres">${genreNames.slice(0,genreNames.length-2)}</p>
        <p class="description">${truncatedOverview}</p>
        <p></p>
    </div>
    <div class="dados">
        <p>Seasons: ${number_of_seasons}</p>
        <p>Episodes: ${number_of_episodes}</p>
        <p>${average}</p>
        <p class="start">Start: ${dataFormatter(firstDate)}</p>
        <p>${lastDate}</p>
        </div>
    `;
    let y = window.innerHeight;
    let scrollY = window.scrollY;
    var centerY = (y - 600) / 2 + scrollY;
    details.style.display = 'block';
    details.style.top = `${centerY}px`;
    document.getElementById('container').classList.add('backdrop-blur');
    isShowingDetails = true;
}

function showDetailsMovie(show){
    
    const { release_date, genres, title, overview, poster_path, budget, runtime, revenue} = show;

    const releaseDate = release_date || 'No release date';
    const truncatedOverview = overview.length > 644 ? overview.slice(0,644) + '...' : overview;
    const imagePath = poster_path ? imgApi + poster_path : "./null.png";
    let genreNames = ""
    for (let i = 0; i < genres.length; i++) {
        genreNames += genres[i].name;
        genreNames += ', ';
    }
    let budgetString = "";
    let revenueString = "";
    if(budget > 0){
        budgetString = `Budget: $ ${moneyFormatter(budget)}`
    }
    if(revenue > 0){
        revenueString = `Revenue: $ ${moneyFormatter(revenue)}`
    }
    // Anexar a nova div ao corpo do documento
    details = document.getElementById('details');
    details.innerHTML = `
    <p class="details-btn" onclick="hideDetails()">X</p>
    <img class="details-img" src=${imagePath} height="100%">
    <div class="cabecalho">
        <h1 class="title">${title}</h1>
        <p class="genres">${genreNames.slice(0,genreNames.length-2)}</p>
        <p class="description">${truncatedOverview}</p>
        <p></p>
    </div>
    <div class="dados">
        <p>${budgetString}</p>
        <p>${revenueString}</p>
        <p class="start">Release: ${dataFormatter(releaseDate)}</p>
        <p>Runtime: ${runtime}min</p>
        </div>
    `;
    let y = window.innerHeight;
    let scrollY = window.scrollY;
    var centerY = (y - 600) / 2 + scrollY;
    details.style.display = 'block';
    details.style.top = `${centerY}px`;
    document.getElementById('container').classList.add('backdrop-blur');
    isShowingDetails = true;
}

function hideDetails(){
    if(isShowingDetails){
        document.getElementById('details').style.display = 'none';
        document.getElementById('container').classList.remove('backdrop-blur');
        isShowingDetails = false;
}
}
async function clickCard(id, type){
    isSearching = true;
    const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=fc535d51c073ba114e04ff261a9b6350&language=pt-BR`
    await fetchDetails(url, type)
}
init();

function randomLetter(){
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'i', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'v']
    const number = Math.floor(Math.random() * 17);
    return letters[number];
}

function dataFormatter(oldDate){
    const data = new Date(oldDate);
    const dia = data.getDate();
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    // Formatar a data como "dd/MM/YYYY"
    dataFormatada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
    return dataFormatada;
}

function capturarPosicaoMouse(event) {
    posicaoMouse = event.clientY + window.scrollY;
    console.log('Click: ' + posicaoMouse + 'px');
}

function moneyFormatter(value){
    const k = value/1000;
    if(k > 1000){
        const m = k/1000;
        if(m > 1000){
            const b = m/1000;
            return `${b.toFixed(1)} B`;
        }
        return `${m.toFixed(1)} M`;
    }
    else{
        return `${k.toFixed(1)} K`;
    }
}