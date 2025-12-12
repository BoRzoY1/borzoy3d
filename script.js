// script.js (Финальная версия с поддержкой Dropbox)

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


// --- НОВАЯ/ОБНОВЛЕННАЯ ФУНКЦИЯ: Преобразование внешних ссылок ---
function transformExternalLink(link) {
    if (!link) return link;

    // 1. Преобразование ссылок DROPBOX в прямые URL
    if (link.includes('dropbox.com')) {
        // Заменяем "www.dropbox.com" на "dl.dropboxusercontent.com"
        // и удаляем или заменяем параметр "?dl=0" на "?raw=1" для прямого воспроизведения.
        return link.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?raw=1');
    }

    // 2. Преобразование ссылок GOOGLE DRIVE (оставим, как запасной вариант)
    if (link.includes('drive.google.com')) {
        const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            const fileId = match[1];
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
    }
    
    // Возвращаем как есть (если это локальный путь или прямой URL)
    return link;
}


// --- Инициализация и Структура Данных ---
const defaultPortfolio = [
    {
        name: 'Кибер-Ниндзя V1',
        thumb: 'images/char_thumb_1.jpg',
        images: ['images/cyber_full.jpg', 'images/cyber_wireframe.jpg', 'images/cyber_mesh.jpg'],
        videos: [
            // *** ОБРАЗЕЦ: Используйте URL Dropbox (например: https://www.dropbox.com/s/abcdef123456/video.mp4?dl=0) ***
            { path: 'videos/cyber_turnaround.mp4', comment: 'Полный оборот персонажа (Замените на URL Dropbox)' },
            { path: 'videos/cyber_anim.mp4', comment: 'Демонстрация базовой анимации (Замените на URL Dropbox)' }
        ]
    },
    {
        name: 'Лесной Маг (Стилизация)',
        thumb: 'images/char_thumb_2.jpg',
        images: ['images/mage_pose_1.jpg', 'images/mage_details.jpg'],
        videos: [
            { path: 'videos/mage_render.mp4', comment: 'Финальный рендер в Marmoset Toolbag (Замените на URL Dropbox)' }
        ]
    }
];

let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || defaultPortfolio;

function savePortfolio() {
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    renderPortfolio();
}

// --- Функции Рендеринга, Админки и Модальных Окон (Неизменны) ---
// (Весь остальной код остался таким же, как в предыдущем сообщении, только с использованием transformExternalLink)

function renderPortfolio() {
    gallery.innerHTML = '';
    portfolioData.forEach((item, index) => {
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


let videoObserver;

function setupVideoObserver() {
    if (videoObserver) {
        videoObserver.disconnect();
    }

    const options = {
        root: document.getElementById('myModal'),
        rootMargin: '0px',
        threshold: 1.0
    };

    videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.muted = false;
                video.play().catch(error => console.log("Autoplay prevented:", error));
            } else {
                video.pause();
                video.muted = true;
            }
        });
    }, options);

    videoList.querySelectorAll('video').forEach(video => {
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
            const wrapper = document.createElement('div');
            wrapper.classList.add('carousel-image-wrapper');
            const img = document.createElement('img');
            img.src = imagePath;
            img.classList.add('carousel-image');
            img.onclick = (e) => {
                e.stopPropagation();
                openZoomModal(imagePath);
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
        item.videos.forEach(videoItem => {
            const container = document.createElement('div');
            container.classList.add('video-item');

            // *** КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Используем новую функцию для внешних ссылок ***
            const videoSource = transformExternalLink(videoItem.path);

            const video = document.createElement('video');
            video.src = videoSource;
            video.controls = false;
            video.loop = true;
            video.muted = true;

            video.onmouseenter = () => { video.controls = true; };
            video.onmouseleave = () => {
                if (video.paused || document.fullscreenElement) return;
                video.controls = false;
            };

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
