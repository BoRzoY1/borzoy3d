// script.js (Финальная версия с исправленной загрузкой превью)

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


// --- 1. УТИЛИТЫ: Преобразование внешних ссылок ---
function transformExternalLink(link) {
    if (!link) return link;
    // DROPBOX
    if (link.includes('dropbox.com')) {
        return link.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?raw=1');
    }
    // GOOGLE DRIVE
    if (link.includes('drive.google.com')) {
        const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            const fileId = match[1];
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }
    return link;
}
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}


// --- 2. ДАННЫЕ И РЕНДЕРИНГ ---
const defaultPortfolio = [
    {
        name: 'Профессор Мортимер',
        // ВНИМАНИЕ: Если thumb это локальный файл (например, 'images/1.jpg'), transformExternalLink его не изменит.
        // Если это внешний ресурс, он будет исправлен.
        thumb: 'https://dl.dropboxusercontent.com/scl/fi/mstspscecsx1yldqk851g/1.jpg?rlkey=eg6xz94myutc5s0lcz04aht9y&st=qy0hng39&dl=0',
        images: [
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
            { path: 'https://dl.dropboxusercontent.com/scl/fi/lcfptkdpi97m8diabnm7e/Face_CC.mp4?rlkey=t87zz7ep6ljdsnawfxpub891e&st=xp6tgmxv&dl=0', comment: 'Работа лицевых морфов' },
            { path: 'https://dl.dropboxusercontent.com/scl/fi/taunwsgy2vkyxgjdt1ubp/FinalRender.mp4?rlkey=2h1z881wj73gh7ctubort3c0c&st=a0u625b6&dl=0', comment: 'Небоьшой синиматик, решил сделать для теста' },
            { path: 'https://dl.dropboxusercontent.com/scl/fi/ipmg2p2piewgautqe84c9/Game.mp4?rlkey=psif5rxlma8ix12zeagrbwv0b&st=u66erdum&dl=0', comment: 'Персонаж отлично работает в игре в UE5' }
        ]
    }
];
let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || defaultPortfolio;
function savePortfolio() {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    renderPortfolio();
}

// ИСПРАВЛЕНИЕ: Применяем transformExternalLink к item.thumb
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


// --- 3. ЛОГИКА ВИДЕОПЛЕЕРА И МОДАЛЬНОГО ОКНА (Без изменений) ---
function pauseOtherVideos(currentVideo) {
    videoList.querySelectorAll('video').forEach(video => {
        if (video !== currentVideo && !video.paused) {
            video.pause();
        }
    });
}
let videoObserver;
function setupVideoObserver() {
    if (videoObserver) {
        videoObserver.disconnect();
    }
    const videos = videoList.querySelectorAll('video');
    const isMobileDevice = isMobile();
    videos.forEach(video => {
        const spinner = video.parentNode.querySelector('.video-spinner');
        video.addEventListener('waiting', () => { if (spinner) spinner.style.display = 'block'; });
        video.addEventListener('playing', () => { if (spinner) spinner.style.display = 'none'; });
        video.addEventListener('canplay', () => { if (spinner) spinner.style.display = 'none'; });
        video.addEventListener('stalled', () => { if (spinner) spinner.style.display = 'block'; });
        video.addEventListener('play', () => pauseOtherVideos(video));
    });
    if (isMobileDevice) {
        if (videos.length > 0) {
            videos.forEach(video => { video.controls = true; });
            videos[0].muted = false; 
            videos[0].play().catch(error => { console.log("Mobile Autoplay failed, user must initiate:", error); });
        }
    } else {
        const options = { root: document.getElementById('myModal'), rootMargin: '0px', threshold: 1.0 };
        videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.muted = false; video.controls = false; 
                    video.play().then(() => { pauseOtherVideos(video); }).catch(error => console.log("Autoplay prevented:", error));
                } else {
                    video.pause(); video.muted = false; video.controls = false;
                }
            });
        }, options);
        videos.forEach(video => { video.controls = false; videoObserver.observe(video); });
    }
}
function openModal(index) {
    const item = portfolioData[index];
    modalTitle.textContent = item.name;
    imageCarousel.innerHTML = '';
    videoList.innerHTML = '';
    if (item.images && item.images.length > 0) {
        item.images.forEach(imagePath => {
            const imageSource = transformExternalLink(imagePath);
            const wrapper = document.createElement('div');
            wrapper.classList.add('carousel-image-wrapper');
            const img = document.createElement('img');
            img.src = imageSource;
            img.classList.add('carousel-image');
            img.onclick = (e) => { e.stopPropagation(); openZoomModal(imageSource); };
            wrapper.appendChild(img);
            imageCarousel.appendChild(wrapper);
        });
        document.getElementById('modal-images').style.display = 'block';
    } else {
        document.getElementById('modal-images').style.display = 'none';
    }
    const isMobileDevice = isMobile();
    if (item.videos && item.videos.length > 0) {
        item.videos.forEach((videoItem) => {
            const container = document.createElement('div');
            container.classList.add('video-item', 'video-container');
            const videoSource = transformExternalLink(videoItem.path);
            const video = document.createElement('video');
            video.src = videoSource;
            video.loop = true; video.muted = false; video.controls = isMobileDevice; 
            if (!isMobileDevice) {
                video.onmouseenter = () => { video.controls = true; };
                video.onmouseleave = () => { if (video.paused || document.fullscreenElement) return; video.controls = false; };
            }
            const spinner = document.createElement('div');
            spinner.classList.add('video-spinner'); spinner.style.display = 'none'; 
            container.appendChild(video); container.appendChild(spinner);
            const comment = document.createElement('p');
            comment.classList.add('video-comment'); comment.textContent = videoItem.comment;
            container.appendChild(comment); videoList.appendChild(container);
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
        if (videoObserver) { videoObserver.disconnect(); }
        videoList.querySelectorAll('video').forEach(video => {
            video.pause(); video.muted = false; 
            const spinner = video.parentNode.querySelector('.video-spinner');
            if (spinner) spinner.style.display = 'none';
        });
        modal.style.display = "none";
    }
}
function scrollCarousel(direction) {
    const scrollAmount = imageCarousel.offsetWidth * direction;
    imageCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
