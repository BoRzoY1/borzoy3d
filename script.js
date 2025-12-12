// script.js (Финальная версия с исправленными путями фото и логикой ПК)

const ADMIN_PASSWORD = "admin123";
let isAdminMode = false;
const adminPanel = document.getElementById('admin-panel');
const gallery = document.getElementById('portfolio-gallery');

// --- Элементы Модального Окна ---
var modal = document.getElementById("myModal");
var modalTitle = document.getElementById('modal-title');
var imageCarousel = document.getElementById('image-carousel');
var videoList = document.getElementById('video-list');
var zoomModal = document.getElementById('zoom-modal');
var zoomContent = document.getElementById('zoom-content');

// --- Глобальные переменные для видео ---
let videoObserver;
// Определяем мобильное устройство (для логики автозапуска)
const isMobile = window.innerWidth <= 768; 

// --- НОВАЯ/ОБНОВЛЕННАЯ ФУНКЦИЯ: Преобразование внешних ссылок (ОБЯЗАТЕЛЬНА ДЛЯ ФОТО И ВИДЕО) ---
function transformExternalLink(link) {
    if (!link) return link;
    // 1. Преобразование ссылок DROPBOX в прямые URL
    if (link.includes('dropbox.com')) {
        // Заменяем 'dl=0' на 'raw=1' для прямого доступа к файлу
        // Примечание: В новых ссылках Dropbox (scl/fi/...) 'dl=0' может не быть, но замена всегда безопасна
        const rawLink = link.replace('?dl=0', '&raw=1').replace('&dl=0', '&raw=1');
        // В некоторых случаях может понадобиться дополнительная замена:
        return rawLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }
    // 2. Преобразование ссылок GOOGLE DRIVE
    if (link.includes('drive.google.com')) {
        const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            const fileId = match[1];
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }
    return link;
}


// --- Инициализация и Структура Данных (ИС-ПРАВ-ЛЕ-НО) ---
const defaultPortfolio = [
    {
        name: 'Профессор Мортимер',
        // ТУМБНЕЙЛ ОСТАВЛЕН ОТОСИТЕЛЬНЫМ, ЕСЛИ ОН ЛОКАЛЬНЫЙ
        thumb: 'https://dl.dropboxusercontent.com/scl/fi/mstspscecsx1yldqk851g/1.jpg?rlkey=eg6xz94myutc5s0lcz04aht9y&st=qy0hng39&dl=0', 
        images: [
            // ИСПРАВЛЕННЫЕ ПУТИ ФОТО DROPBOX
            'https://dl.dropboxusercontent.com/scl/fi/mstspscecsx1yldqk851g/1.jpg?rlkey=eg6xz94myutc5s0lcz04aht9y&st=qy0hng39&dl=0', 
            'https://dl.dropboxusercontent.com/scl/fi/rl0oigzkusgywne8aodz8/2.jpg?rlkey=7bll963z8zwembkzhi594eymz&st=yhuzxaor&dl=0', 
            'https://dl.dropboxusercontent.com/scl/fi/wwmte98i6k5c4kohchk6w/3.jpg?rlkey=2nwfnoifn4jhsnw4cu207dhym&st=mbopky0z&dl=0', 
            'https://dl.dropboxusercontent.com/scl/fi/z50rjnovl8q0y1aykv85r/4.jpg?rlkey=sa9mxg0lf83u5lmx0djwnniwx&st=mho345z5&dl=0', 
            'https://dl.dropboxusercontent.com/scl/fi/5ys8p6c8a3jwrso2mfnjh/Setka1.jpg?rlkey=ew5ug22upzwnosvwzg2ws3lwu&st=divoyzwa&dl=0', 
            'https://dl.dropboxusercontent.com/scl/fi/0ejxct6v6w8oiiwexcbmy/Setka2.jpg?rlkey=d32u8oz0s78yguv7zbddiun9n&st=d2ljtd4r&dl=0', 
            'https://dl.dropboxusercontent.com/scl/fi/9ikt5esccapenyskc0t55/Setka3.jpg?rlkey=vmwavh14gcawave5why2p3t4e&st=di39z041&dl=0', 
            'https://dl.dropboxusercontent.com/scl/fi/mcfdouh1ru26itf7ac6gi/Setka4.jpg?rlkey=izof5dp8itdendf65ia9gn800&st=8pelihnb&dl=0'
        ],
        videos: [
            { 
                path: 'https://dl.dropboxusercontent.com/scl/fi/lcfptkdpi97m8diabnm7e/Face_CC.mp4?rlkey=t87zz7ep6ljdsnawfxpub891e&st=xp6tgmxv&dl=0', 
                comment: 'Работа лицевых морфов' 
            },
            { 
                path: 'https://dl.dropboxusercontent.com/scl/fi/taunwsgy2vkyxgjdt1ubp/FinalRender.mp4?rlkey=2h1z881wj73gh7ctubort3c0c&st=a0u625b6&dl=0', 
                comment: 'Небоьшой синиматик, решил сделать для теста' 
            },
            { 
                path: 'https://dl.dropboxusercontent.com/scl/fi/ipmg2p2piewgautqe84c9/Game.mp4?rlkey=psif5rxlma8ix12zeagrbwv0b&st=u66erdum&dl=0', 
                comment: 'Персонаж отлично работает в игре в UE5' 
            }
        ]
    } 
];

let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || defaultPortfolio;

function savePortfolio() {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    renderPortfolio();
}

// --- Функции Рендеринга, Админки (Оставлены без изменений) ---

function renderPortfolio() {
    gallery.innerHTML = '';
    portfolioData.forEach((item, index) => {
        // ВНИМАНИЕ: item.thumb остаётся без transformExternalLink, предполагая, что превью локальное или уже прямое.
        const itemHTML = `
            <div class="item-container">
                <div class="item" onclick="openModal(${index})">
                    <img src="${item.thumb}" alt="${item.name}">
                </div>
                <div class="item-caption">
                    ${item.name}
                    ${isAdminMode ? `<button onclick="event.stopPropagation(); deleteItem(${index});">Удалить</button>` : ''}
                </div>
            </div>
        `;
        gallery.insertAdjacentHTML('beforeend', itemHTML);
    });
}
function deleteItem(index) {
    if (confirm(`Вы уверены, что хотите удалить работу "${portfolioData[index].name}"?`)) {
        portfolioData.splice(index, 1);
        savePortfolio();
    }
}
window.addEventListener('keypress', function(e) {
    if (e.key === '/') {
        e.preventDefault();
        const input = prompt("Введите пароль администратора:");
        if (input === ADMIN_PASSWORD) {
            isAdminMode = true;
            adminPanel.style.display = 'block';
            alert("Режим администратора активирован.");
            renderPortfolio();
        } else if (input !== null) {
            alert("Неверный пароль.");
        }
    }
});
function addPortfolioItem() {
    const name = document.getElementById('name-input').value.trim();
    const thumb = document.getElementById('thumb-input').value.trim();
    const imagesStr = document.getElementById('images-input').value.trim();
    const videosStr = document.getElementById('videos-input').value.trim();

    if (!name || !thumb) {
        alert("Поля 'Название' и 'Превью' обязательны!");
        return;
    }
    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()) : [];
    const videos = videosStr ? videosStr.split(',').map(s => {
        const [path, comment] = s.trim().split('|');
        return { path: path ? path.trim() : '', comment: comment ? comment.trim() : 'Нет комментария' };
    }) : [];
    if (images.length === 0 && videos.length === 0) {
        alert("Добавьте хотя бы одно изображение или одно видео.");
        return;
    }

    const newItem = { name, thumb, images, videos };
    portfolioData.push(newItem);
    savePortfolio();

    document.getElementById('name-input').value = '';
    document.getElementById('thumb-input').value = '';
    document.getElementById('images-input').value = '';
    document.getElementById('videos-input').value = '';
    alert(`Работа "${name}" добавлена!`);
}


// --- НОВАЯ ЛОГИКА ВИДЕО ---

// 4. Пауза других видео
function pauseOtherVideos(currentVideo) {
    videoList.querySelectorAll('video').forEach(video => {
        if (video !== currentVideo) {
            video.pause();
        }
    });
}

// 5. Индикатор Загрузки/Буферизации
function setupVideoLoader(video) {
    const loader = video.closest('.video-item').querySelector('.video-loader');
    
    // Показываем загрузчик при буферизации/зависании
    video.addEventListener('waiting', () => {
        loader.style.display = 'flex';
    });

    // Скрываем загрузчик, когда видео снова начинает играть
    video.addEventListener('playing', () => {
        loader.style.display = 'none';
    });

    // Скрываем загрузчик, если пользователь нажал на паузу
    video.addEventListener('pause', () => {
        loader.style.display = 'none';
    });
    
    // Скрываем загрузчик, когда загружено достаточно данных
    video.addEventListener('loadeddata', () => {
        loader.style.display = 'none';
    });
}

function setupVideoObserver() {
    if (videoObserver) {
        videoObserver.disconnect();
    }

    const videos = videoList.querySelectorAll('video');
    if (videos.length === 0) return;

    // На ПК (1.0), На Телефоне (0.8 - более мягкий, чтобы не требовать полной видимости)
    const thresholdValue = isMobile ? 0.8 : 1.0; 
    
    const options = {
        root: document.getElementById('myModal'),
        rootMargin: '0px',
        threshold: thresholdValue
    };

    videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            const video = entry.target;
            const isFirstVideo = index === 0; 
            
            if (entry.isIntersecting) {
                if (isMobile && isFirstVideo) {
                    // ЛОГИКА ДЛЯ ТЕЛЕФОНА: Автозапуск/Остановка только для первого видео
                    video.muted = true; 
                    video.play().then(() => {
                        video.muted = false; 
                    }).catch(error => {
                         console.log("Autoplay prevented on mobile for first video:", error);
                         video.muted = false;
                    });
                } else if (!isMobile) {
                    // ЛОГИКА ДЛЯ ПК (ВОССТАНОВЛЕНА): Автозапуск всех видео при 100% фокусе
                     video.muted = true;
                     video.play().catch(error => console.log("Autoplay prevented on desktop:", error));
                }
                
            } else {
                // При выходе из фокуса (ПК и Телефон)
                video.pause();
                // 3. Вернули mute при уходе из фокуса (для корректной работы автозапуска при повторном появлении)
                video.muted = true; 
                // Скрываем лоадер, если видео уходит из фокуса
                video.closest('.video-item').querySelector('.video-loader').style.display = 'none';
            }
        });
    }, options);

    videos.forEach((video, index) => {
        // 4. Пауза других видео
        video.addEventListener('play', () => {
            pauseOtherVideos(video);
        });

        // 5. Индикатор загрузки
        setupVideoLoader(video);
        
        // Начинаем наблюдение IntersectionObserver
        videoObserver.observe(video);
    });
}

function openModal(index) {
    const item = portfolioData[index];
    modalTitle.textContent = item.name;
    imageCarousel.innerHTML = '';
    videoList.innerHTML = '';

    // 1. Загрузка Изображений (ИС-ПРАВ-ЛЕ-НО: Применение transformExternalLink)
    if (item.images && item.images.length > 0) {
        item.images.forEach(imagePath => {
            // ПРИМЕНЯЕМ transformExternalLink для корректного отображения Dropbox фото
            const imageSource = transformExternalLink(imagePath); 
            
            const wrapper = document.createElement('div');
            wrapper.classList.add('carousel-image-wrapper');
            const img = document.createElement('img');
            img.src = imageSource;
            img.classList.add('carousel-image');
            img.onclick = (e) => {
                e.stopPropagation();
                openZoomModal(imageSource);
            };
            wrapper.appendChild(img);
            imageCarousel.appendChild(wrapper);
        });
        document.getElementById('modal-images').style.display = 'block';
    } else {
        document.getElementById('modal-images').style.display = 'none';
    }

    // 2. Загрузка Видео с Комментариями
    if (item.videos && item.videos.length > 0) {
        item.videos.forEach((videoItem, index) => {
            const container = document.createElement('div');
            container.classList.add('video-item');

            const videoSource = transformExternalLink(videoItem.path);

            const video = document.createElement('video');
            video.src = videoSource;
            // 2. Вернули controls у всех видео 
            video.controls = true; 
            video.loop = true;
            
            if (isMobile) {
                // На мобильном: только первое видео muted для автозапуска, остальные unmute
                video.muted = (index === 0) ? true : false; 
            } else {
                // ЛОГИКА ДЛЯ ПК (ВОССТАНОВЛЕНА): muted: true для автозапуска. Controls скрыты по умолчанию.
                video.muted = true;
                video.controls = false; 
                 video.onmouseenter = () => { video.controls = true; };
                 video.onmouseleave = () => {
                    if (video.paused || document.fullscreenElement) return;
                    video.controls = false;
                 };
            }
            
            // 5. HTML для лоадера
            const loaderHTML = `
                <div class="video-loader">
                    <div class="spinner"></div>
                    <p>Загрузка...</p>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', loaderHTML);

            container.appendChild(video);

            const comment = document.createElement('p');
            comment.classList.add('video-comment');
            comment.textContent = videoItem.comment;
            container.appendChild(comment);

            videoList.appendChild(container);
        });
        document.getElementById('modal-videos').style.display = 'block';
    } else {
        document.getElementById('modal-videos').style.display = 'none';
    }

    modal.style.display = "block";

    setTimeout(setupVideoObserver, 500);
}

function closeModal(event) {
    if (event.target.classList.contains('modal') || event.target.classList.contains('close')) {
        if (videoObserver) {
            videoObserver.disconnect();
        }
        videoList.querySelectorAll('video').forEach(video => {
            video.pause();
            video.muted = true;
        });
        // Скрываем все лоадеры при закрытии модального окна
        videoList.querySelectorAll('.video-loader').forEach(loader => {
            loader.style.display = 'none';
        });
        modal.style.display = "none";
    }
}

function scrollCarousel(direction) {
    const scrollAmount = imageCarousel.offsetWidth * direction;
    imageCarousel.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

function openZoomModal(imagePath) {
    zoomContent.src = imagePath;
    zoomModal.style.display = "block";
}

function closeZoomModal(event) {
    if (event.target.id === 'zoom-modal' || event.target.id === 'zoom-close') {
        zoomModal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', renderPortfolio);
