$(document).ready(function () {
    const apiKey = "4e724967b95c4fab86c05827b7acf439";

    function getNews(searchQuery = "") {
        const apiUrl = `http://localhost:3000/news-day?query=${searchQuery}`;
        const cacheKey = `newsCache_${searchQuery}`;

        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            displayNews(JSON.parse(cachedData));
        } else {
            $.ajax({
                url: apiUrl,
                method: "GET",
                success: function (response) {
                    localStorage.setItem(cacheKey, JSON.stringify(response.articles));
                    displayNews(response.articles);
                },
                error: function (xhr, status, error) {
                    console.error(xhr.responseText);
                    $('#newsContainer').html('<p>Errore nel caricamento delle notizie. Controlla la console per ulteriori informazioni.</p>');
                }
            });
        }
    }

    function displayNews(articles, containerId = 'newsContainer') {
        const container = $(`#${containerId}`);
        container.empty();

        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        articles.forEach(article => {
            const isFavorite = isArticleAlreadyInFavorites(article, favorites);
            const articleHtml = `
                <div class="article ${isFavorite ? 'favorite' : ''}">
                    <img src="${article.urlToImage ? article.urlToImage : 'placeholder.png'}" alt="News Image">
                    <h2>${article.title}</h2>
                    <p>${article.description}</p>
                    <a href="${article.url}" target="_blank">Leggi di più</a>
                    <button class="favoriteButton" data-title="${article.title}" data-description="${article.description}" data-url="${article.url}" data-image="${article.urlToImage ? article.urlToImage : 'placeholder.png'}">${isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}</button>
                </div>
            `;
            container.append(articleHtml);
        });

        $('.favoriteButton').on('click', function () {
            const title = $(this).data('title');
            const description = $(this).data('description');
            const url = $(this).data('url');
            const image = $(this).data('image');

            if ($(this).hasClass('favorite')) {
                removeFavorite(title, url);
            } else {
                saveToFavorites(title, description, url, image);
            }
        });
    }

    function saveToFavorites(title, description, url, image) {
        const favoriteArticle = {
            title: title,
            description: description,
            url: url,
            image: image
        };

        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (!isArticleAlreadyInFavorites(favoriteArticle, favorites)) {
            favorites.push(favoriteArticle);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('Articolo aggiunto ai preferiti!');
        } else {
            alert('L\'articolo è già nei preferiti!');
        }

        // Aggiorna la visibilità del pulsante "Vai alle notizie salvate"
        toggleScrollToFavoritesButton();
    }

    function isArticleAlreadyInFavorites(article, favorites) {
        return favorites.some(favorite => {
            return favorite.title === article.title && favorite.url === article.url;
        });
    }

    function displayFavorites() {
        const favoritesContainer = $('#favoritesContainer');
        favoritesContainer.empty();

        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (favorites.length > 0) {
            favoritesContainer.show();
            favoritesContainer.append('<div class="savedText">Notizie Salvate</div>'); // Aggiunge la scritta "Notizie Salvate"
            favorites.forEach(article => {
                const favoriteHtml = `
                    <div class="article favorite">
                        <img src="${article.image}" alt="News Image">
                        <h2>${article.title}</h2>
                        <p>${article.description}</p>
                        <a href="${article.url}" target="_blank">Leggi di più</a>
                        <button class="removeFavoriteButton" data-title="${article.title}" data-url="${article.url}">Rimuovi dai preferiti</button>
                    </div>
                `;
                favoritesContainer.append(favoriteHtml);
            });

            $('.removeFavoriteButton').on('click', function () {
                const title = $(this).data('title');
                const url = $(this).data('url');
                removeFavorite(title, url);
            });
        } else {
            favoritesContainer.hide();
        }

        // Aggiorna la visibilità del pulsante "Vai alle notizie salvate"
        toggleScrollToFavoritesButton();
    }

    function removeFavorite(title, url) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        favorites = favorites.filter(article => {
            return article.title !== title || article.url !== url;
        });

        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }

    // Funzione per mostrare/nascondere il pulsante "Vai alle notizie salvate"
    function toggleScrollToFavoritesButton() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const scrollButton = $('#scrollToFavoritesButton');
        if (favorites.length > 0) {
            scrollButton.show();
        } else {
            scrollButton.hide();
        }
    }

    // Gestisci il clic sul pulsante "Vai alle notizie salvate"
    $('#scrollToFavoritesButton').on('click', function () {
        $('html, body').animate({
            scrollTop: $('#favoritesContainer').offset().top
        }, 1000);
    });

    // Aggiungi il pulsante "Torna su" alla parte inferiore della pagina
    $('body').append('<button id="scrollTopButton" style="display: none;">Torna su</button>');

    // Gestisci il clic sul pulsante "Torna su"
    $('#scrollTopButton').on('click', function () {
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });

    // Mostra il pulsante "Torna su" quando si scorre la pagina verso il basso
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('#scrollTopButton').fadeIn();
        } else {
            $('#scrollTopButton').fadeOut();
        }
    });

    // Chiamare la funzione al caricamento della pagina per controllare se ci sono notizie salvate
    toggleScrollToFavoritesButton();

    // Chiamate iniziali per ottenere le notizie
    getNews("world");

    // Gestisci la ricerca di notizie
    $('#searchInput').on('input', function () {
        const searchQuery = $(this).val();
        getNews(searchQuery);
    });

    // Gestisci il clic sul pulsante per visualizzare/nascondere le notizie salvate
    $('#favoritesButton').on('click', function () {
        $('#newsContainer').toggleClass('favorites');
        $('#favoritesContainer').toggleClass('favorites');
        displayFavorites();
    });
});