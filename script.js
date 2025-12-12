// script.js (Финальная, Гарантированно Рабочая Версия)

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
const isMobile = window.innerWidth <= 768; 


// --- ИСПРАВЛЕНИЕ #1: Надежная Трансформация Ссылок ---
function transformExternalLink(link) {
    if (!link) return link;
    
    // 1. Преобразование ссылок DROPBOX в прямые URL для любых файлов (наиболее надежный способ)
    if (link.includes('dropbox.com')) {
        // Замена домена на dl.dropboxusercontent.com
        let directLink = link.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dropbox.com', 'dl.dropboxusercontent.com');
        
        // Удаление всех параметров, кроме raw=1
        if (directLink.includes('?')) {
            directLink = directLink.substring(0, directLink.indexOf('?'));
        }
        
        // Добавление гарантированного параметра ?raw=1
        return directLink + '?raw=1';
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


// --- Инициализация и Структура Данных ---
const defaultPortfolio = [
    {
        name: 'Профессор Мортимер',
        thumb: 'https://dl.dropboxusercontent.com/scl/fi/mstspscecsx1yldqk851g/1.jpg?rlkey=eg6xz94myutc5s0lcz04aht9y&st=qy0hng39&dl=0', 
        images: [
            // Теперь эти ссылки гарантированно будут преобразованы в прямые с помощью transformExternalLink
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

function renderPortfolio() {
    gallery.innerHTML = '';
    portfolioData.forEach((item, index) => {
        const itemHTML = `
            <div class="item-container">
                <div class="item" onclick="openModal(${index})">
                    <img src="${transformExternalLink(item.thumb)}" alt="${item.name}">
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


// --- ИСПРАВЛЕНИЕ #2: ВОССТАНОВЛЕНИЕ ЛОГИКИ ПК / IntersectionObserver ---

function pauseOtherVideos(currentVideo) {
    videoList.querySelectorAll('video').forEach(video => {
        if (video !== currentVideo) {
            video.pause();
        }
    });
}

function setupVideoLoader(video) {
    const loader = video.closest('.video-item').querySelector('.video-loader');
    
    video.addEventListener('waiting', () => { loader.style.display = 'flex'; });
    video.addEventListener('playing', () => { loader.style.display = 'none'; });
    video.addEventListener('pause', () => { loader.style.display = 'none'; });
    video.addEventListener('loadeddata', () => { loader.style.display = 'none'; });
}

function setupVideoObserver() {
    if (videoObserver) {
        videoObserver.disconnect();
    }

    const videos = videoList.querySelectorAll('video');
    if (videos.length === 0) return;

    // 100% видимости для ПК, 80% для мобильных
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
                if (isMobile) {
                    // ЛОГИКА ДЛЯ ТЕЛЕФОНА: Автозапуск/Остановка только для первого видео
                    if (isFirstVideo) {
                        video.muted = true; 
                        video.play().then(() => {
                            video.muted = false; 
                        }).catch(error => {
                             console.log("Autoplay prevented on mobile for first video:", error);
                             video.muted = false;
                        });
                    }
                } else {
                    // ЛОГИКА ДЛЯ ПК: Автозапуск при 100% фокусе ( muted: true - ОБЯЗАТЕЛЬНО!)
                     video.muted = true; 
                     video.play().catch(error => console.log("Autoplay blocked on desktop:", error));
                }
                
            } else {
                // При выходе из фокуса (ПК и Телефон)
                video.pause();
                video.muted = true; // Снова мьютим для следующего автозапуска
                video.closest('.video-item').querySelector('.video-loader').style.display = 'none';
            }
        });
    }, options);

    videos.forEach((video, index) => {
        // Устанавливаем паузу для других видео при старте текущего
        video.addEventListener('play', () => {
            pauseOtherVideos(video);
        });

        setupVideoLoader(video);
        
        videoObserver.observe(video);
    });
}

function openModal(index) {
    const item = portfolioData[index];
    modalTitle.textContent = item.name;
    imageCarousel.innerHTML = '';
    videoList.innerHTML = '';

    // 1. Загрузка Изображений
    if (item.images && item.images.length > 0) {
        item.images.forEach(imagePath => {
            // ИСПОЛЬЗУЕМ transformExternalLink ДЛЯ ГАРАНТИРОВАННО ПРЯМЫХ ССЫЛОК
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

    // 2. Загрузка Видео
    if (item.videos && item.videos.length > 0) {
        item.videos.forEach((videoItem, index) => {
            const container = document.createElement('div');
            container.classList.add('video-item');

            const videoSource = transformExternalLink(videoItem.path);

            const video = document.createElement('video');
            video.src = videoSource;
            video.controls = true; 
            video.loop = true;
            
            if (isMobile) {
                // Мобильный: Mute только для первого
                video.muted = (index === 0) ? true : false; 
            } else {
                // ПК: Mute всегда. Controls скрыты по умолчанию.
                video.muted = true;
                video.controls = false; 
                
                 // ВОССТАНОВЛЕНА ЛОГИКА ПОКАЗА CONTROLS ТОЛЬКО ПРИ НАВЕДЕНИИ
                 video.onmouseenter = () => { video.controls = true; };
                 video.onmouseleave = () => {
                    // Скрываем controls, только если видео не на паузе и не в полноэкранном режиме
                    if (video.paused || document.fullscreenElement) return;
                    video.controls = false;
                 };
            }
            
            // HTML для лоадера
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

    // Устанавливаем Observer после рендеринга
    setTimeout(setupVideoObserver, 500);
}

function closeModal(event) {
    if (event.target.classList.contains('modal') || event.target.classList.contains('close')) {
        if (videoObserver) {
            videoObserver.disconnect();
        }
        // Пауза и мьют всех видео при закрытии
        videoList.querySelectorAll('video').forEach(video => {
            video.pause();
            video.muted = true;
        });
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
