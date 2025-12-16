// --- 1. ПОРТФОЛИО: ДЕМО-ДАННЫЕ ---
let portfolioData = [
    {
        id: 1,
        title: "K-001 | Скорпион",
        description: "Высокодетализированная модель киборга-наемника. Game-Ready, 120k tris. Рендер в Unreal Engine 5.",
        thumbUrl: "https://dl.dropboxusercontent.com/scl/fi/vkh9v9l5173f0896q6s85/thumb_01.png?rlkey=f1k329b3f66w0y86x148g&dl=0&raw=1", // Прямая ссылка
        tag: "AAA",
        images: [
            "https://dl.dropboxusercontent.com/scl/fi/d3s96d9w2r2j9t4g9y0h1/detail_01_a.png?rlkey=z31f0w2f7s48a5w2e7e4q&dl=0&raw=1",
            "https://dl.dropboxusercontent.com/scl/fi/m0j5s70h2b4p1v5t0o0a2/detail_01_b.png?rlkey=d7v3a8x9y0w3c6f2g4h5i&dl=0&raw=1",
            "https://dl.dropboxusercontent.com/scl/fi/o9z8w7t4c1p2k6d3r5s7/detail_01_c.png?rlkey=a5h3g4f2e1d9s8w7q6p5o&dl=0&raw=1"
        ],
        videos: [
            { url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=cO5z-1e-p8e", comment: "Демонстрация 360° вращения модели и сетки." }
        ]
    },
    {
        id: 2,
        title: "Эльфийский Страж",
        description: "Персонаж для фэнтези RPG. Полный комплект брони и оружия. PBR текстуры 4K.",
        thumbUrl: "https://dl.dropboxusercontent.com/scl/fi/3n9y9u3x2w1v0t8s7r6q/thumb_02.png?rlkey=a2c1b0d9e8f7g6h5i4j3k&dl=0&raw=1",
        tag: "Game Ready",
        images: [
            "https://dl.dropboxusercontent.com/scl/fi/h7j6g5f4d3c2b1a0s9z8/detail_02_a.png?rlkey=k5j4i3h2g1f0e9d8c7b6a&dl=0&raw=1",
            "https://dl.dropboxusercontent.com/scl/fi/r8q7p6o5n4m3l2k1j0i9/detail_02_b.png?rlkey=s9r8q7p6o5n4m3l2k1j0i&dl=0&raw=1"
        ],
        videos: []
    }
    // Здесь будут добавлены другие работы
];

let nextId = 3; 

// --- 2. ФУНКЦИЯ: Преобразование ссылки Dropbox в прямую ---
function transformExternalLink(link) {
    if (link && link.includes('dropbox.com')) {
        // Преобразуем стандартную ссылку в рабочую для прямого доступа
        return link.replace('www.dropbox.com', 'dl.dropboxusercontent.com').split('&st=')[0] + '&raw=1';
    }
    return link;
}

// --- 3. ФУНКЦИЯ: Рендер Портфолио ---
function renderPortfolio() {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';
    
    portfolioData.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container';
        itemContainer.innerHTML = `
            <div class="item" onclick="openModal(${item.id})">
                <img src="${transformExternalLink(item.thumbUrl)}" alt="${item.title}">
                <div class="item-caption">
                    ${item.title} <span class="quality-tag">${item.tag}</span>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteItem(${item.id})">Удалить</button>
                </div>
            </div>
        `;
        gallery.appendChild(itemContainer);
    });
    
    updateAdminPanelSelect();
    toggleDeleteButtons(false); // Скрываем кнопки удаления по умолчанию
}

// --- 4. ФУНКЦИЯ: Модальное Окно ---
function openModal(id) {
    const item = portfolioData.find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('item-modal');
    document.getElementById('modal-title').textContent = item.title;
    document.getElementById('modal-description').textContent = item.description;

    // --- Карусель Изображений ---
    const imageCarousel = document.getElementById('image-carousel');
    imageCarousel.innerHTML = '';
    
    item.images.forEach(imgUrl => {
        const imgElement = document.createElement('img');
        imgElement.src = transformExternalLink(imgUrl);
        imgElement.className = 'carousel-slide';
        imageCarousel.appendChild(imgElement);
    });

    // --- Список Видео ---
    const videoList = document.getElementById('video-list');
    videoList.innerHTML = '';
    if (item.videos && item.videos.length > 0) {
        item.videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                    <iframe src="${video.url}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
                </div>
                <p class="video-comment">${video.comment}</p>
            `;
            videoList.appendChild(videoItem);
        });
        document.getElementById('modal-videos').style.display = 'block';
    } else {
        document.getElementById('modal-videos').style.display = 'none';
    }

    modal.style.display = 'block';
    currentSlide = 0;
    showSlide(currentSlide);
}

// --- Логика Карусели ---
let currentSlide = 0;
function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    
    slides.forEach(slide => slide.style.display = 'none');
    
    if (n >= slides.length) currentSlide = 0;
    if (n < 0) currentSlide = slides.length - 1;
    
    slides[currentSlide].style.display = 'block';
}

function changeSlide(n) {
    currentSlide += n;
    showSlide(currentSlide);
}


// --- 5. ЛОГИКА АДМИН-ПАНЕЛИ ---
const ADMIN_PASSWORD = "admin"; 

function toggleDeleteButtons(show) {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.style.display = show ? 'inline-block' : 'none';
    });
}

function updateAdminPanelSelect() {
    const select = document.getElementById('delete-item-select');
    select.innerHTML = '<option value="">Выберите работу для удаления</option>';
    portfolioData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.title;
        select.appendChild(option);
    });
}

// ДОБАВЛЕНИЕ РАБОТЫ
document.getElementById('add-item').onclick = function() {
    const title = document.getElementById('new-item-title').value;
    const desc = document.getElementById('new-item-desc').value;
    const thumb = document.getElementById('new-item-thumb').value;
    const tag = document.getElementById('new-item-tag').value || 'New';
    const imgList = document.getElementById('new-item-img-list').value;
    const videoList = document.getElementById('new-item-video-list').value;

    if (!title || !thumb) {
        alert("Заголовок и ссылка на превью обязательны!");
        return;
    }

    const newItem = {
        id: nextId++,
        title: title,
        description: desc,
        thumbUrl: thumb,
        tag: tag,
        images: imgList.split(',').map(s => s.trim()).filter(s => s),
        videos: videoList.split(',').map(s => {
            const parts = s.trim().split('|');
            return { url: parts[0], comment: parts[1] || "Видеопрезентация модели" };
        }).filter(v => v.url)
    };

    portfolioData.push(newItem);
    renderPortfolio();
    alert(`Работа "${title}" успешно добавлена!`);
    
    // Очистка полей
    document.querySelectorAll('#admin-tools input').forEach(input => input.value = '');
};

// УДАЛЕНИЕ РАБОТЫ
function deleteItem(id) {
    const itemToDelete = portfolioData.find(i => i.id === id);
    if (confirm(`Вы уверены, что хотите удалить работу "${itemToDelete.title}"?`)) {
        portfolioData = portfolioData.filter(item => item.id !== id);
        renderPortfolio();
    }
}

document.getElementById('delete-item').onclick = function() {
    const id = parseInt(document.getElementById('delete-item-select').value);
    if (id) {
        deleteItem(id);
    } else {
        alert("Выберите работу для удаления.");
    }
};


// ЛОГИН В АДМИН-ПАНЕЛЬ
document.getElementById('admin-login-btn').onclick = function() {
    document.getElementById('admin-panel').style.display = 'block';
};

document.getElementById('admin-login').onclick = function() {
    const password = document.getElementById('admin-password').value;
    const adminTools = document.getElementById('admin-tools');
    
    if (password === ADMIN_PASSWORD) {
        adminTools.style.display = 'block';
        document.getElementById('admin-password').style.display = 'none';
        document.getElementById('admin-login').style.display = 'none';
        
        // Включаем режим администрирования
        toggleDeleteButtons(true); 
        alert("Доступ администратора предоставлен!");
    } else {
        alert("Неверный пароль.");
    }
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    renderPortfolio(); // Загружаем демо-данные при старте
    
    // Закрытие модального окна по клику на "X"
    document.querySelector('.close').onclick = function() {
        document.getElementById('item-modal').style.display = "none";
    };
    
    // Закрытие модального окна по Esc
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.getElementById('item-modal').style.display = "none";
            document.getElementById('admin-panel').style.display = "none";
        }
    });

    // Закрытие по клику вне модального окна
    window.onclick = function(event) {
        const modal = document.getElementById('item-modal');
        const adminPanel = document.getElementById('admin-panel');
        if (event.target === modal) {
            modal.style.display = "none";
        }
        // Чтобы не закрывать панель, если клик был внутри
        if (event.target === adminPanel) {
             adminPanel.style.display = "none";
        }
    };
});
