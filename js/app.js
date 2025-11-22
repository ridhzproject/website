// js/app.js

// --- 1. Inisialisasi & Auth ---
const userData = db.getData();
if (!userData.user) window.location.href = 'index.html';

document.getElementById('welcome-msg').innerText = `Halo, ${userData.user.name}! 👋`;
document.getElementById('quote-text').innerText = QUOTES[Math.floor(Math.random() * QUOTES.length)];

// --- 2. Notification System ---
function requestNotification() {
    if ('Notification' in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}
requestNotification();

function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body, icon: 'assets/icons/icon.png' });
    }
}

// --- 3. Clock & Date Logic ---
const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sep', 'Okt', 'Nov', 'Des'];

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById('digital-clock').innerText = `${h}:${m}:${s}`;
    document.getElementById('current-date').innerText = 
        `${days[now.getDay()].toUpperCase()}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    checkAutoReminders(h, m, s);
    updateCurrentLesson(now);
}

// --- 4. School Schedule Logic ---
function updateCurrentLesson(now) {
    const dayName = days[now.getDay()];
    const todaySchedule = SCHOOL_SCHEDULE[dayName];
    
    const lessonNowEl = document.getElementById('lesson-now');
    const lessonTimeEl = document.getElementById('lesson-time');
    const lessonNextEl = document.getElementById('lesson-next');

    if (!todaySchedule) {
        lessonNowEl.innerText = "Libur";
        lessonTimeEl.innerText = "-";
        lessonNextEl.innerText = "-";
        return;
    }

    const currentTimeVal = now.getHours() * 60 + now.getMinutes();
    let found = false;

    for (let i = 0; i < todaySchedule.length; i++) {
        const [start, end] = todaySchedule[i].jam.split('-');
        const [sH, sM] = start.split('.').map(Number);
        const [eH, eM] = end.split('.').map(Number);
        
        const startVal = sH * 60 + sM;
        const endVal = eH * 60 + eM;

        if (currentTimeVal >= startVal && currentTimeVal < endVal) {
            lessonNowEl.innerText = todaySchedule[i].pelajaran;
            lessonTimeEl.innerText = todaySchedule[i].jam;
            lessonNextEl.innerText = todaySchedule[i+1] ? todaySchedule[i+1].pelajaran : "Pulang";
            found = true;
            
            // Notifikasi Transisi (cek di detik 00)
            if (currentTimeVal === startVal && now.getSeconds() === 0) {
                sendNotification("Ganti Pelajaran!", `Sekarang: ${todaySchedule[i].pelajaran}`);
            }
            break;
        }
    }

    if (!found) {
        if(currentTimeVal < 06*60 + 45) {
             lessonNowEl.innerText = "Belum Masuk";
             lessonNextEl.innerText = todaySchedule[0].pelajaran;
        } else {
             lessonNowEl.innerText = "Sudah Pulang";
             lessonNextEl.innerText = "-";
        }
    }
}

// Render Full Schedule
function renderFullSchedule() {
    const container = document.getElementById('full-schedule');
    let html = '';
    for(let day in SCHOOL_SCHEDULE) {
        html += `<h4>${day.toUpperCase()}</h4><ul style="margin-bottom:10px;">`;
        SCHOOL_SCHEDULE[day].forEach(item => {
            html += `<li><span>${item.jam}</span> <span>${item.pelajaran}</span></li>`;
        });
        html += `</ul>`;
    }
    container.innerHTML = html;
}
renderFullSchedule();

function toggleSchedule() {
    document.getElementById('full-schedule').classList.toggle('hidden');
}

// --- 5. Reminder / Task Logic ---
function renderReminders() {
    const list = document.getElementById('reminder-list');
    list.innerHTML = '';
    const reminders = db.getData().reminders;
    
    reminders.forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${r.message}</span>
            <button class="btn-small btn-danger" onclick="deleteTask('${r.id}')">X</button>
        `;
        list.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById('task-input');
    if(input.value) {
        db.addReminder({ message: input.value, type: 'task' });
        input.value = '';
        renderReminders();
    }
}

function deleteTask(id) {
    db.deleteReminder(id);
    renderReminders();
}

// --- 6. Sholat Logic ---
async function loadSholat() {
    const data = db.getData();
    document.getElementById('location-name').innerText = data.sholat_settings.city_name;
    
    const jadwal = await PrayerAPI.getSchedule(data.sholat_settings.city_id);
    if(jadwal) {
        const list = document.getElementById('sholat-list');
        const times = ['subuh', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya'];
        let html = '';
        
        times.forEach(t => {
            html += `<li><span style="text-transform:capitalize">${t}</span> <b>${jadwal[t]}</b></li>`;
        });
        list.innerHTML = html;

        // Cek Waktu Sholat untuk Notifikasi (Sederhana)
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        times.forEach(t => {
            if(currentTime === jadwal[t] && now.getSeconds() === 0) {
                sendNotification("Waktunya Sholat!", `Sudah masuk waktu ${t}`);
            }
        });
    }
}

async function changeCity() {
    const city = prompt("Masukkan nama kota (contoh: Jakarta):");
    if(city) {
        const results = await PrayerAPI.searchCity(city);
        if(results.length > 0) {
            // Ambil yang pertama
            db.updateSholatCity(results[0].id, results[0].lokasi);
            loadSholat(); // Reload
        } else {
            alert("Kota tidak ditemukan!");
        }
    }
}

// --- 7. Auto Reminder Logic (Sleep & Tomorrow) ---
let sleepNotified = false;
let tomorrowNotified = false;

function checkAutoReminders(h, m, s) {
    // Reminder Tidur 21:00
    if(h === '21' && m === '00' && !sleepNotified) {
        sendNotification("Waktunya Tidur 😴", "Bismika Allahumma ahya wa bismika amut. Matikan HP dan istirahat.");
        sleepNotified = true;
    }
    
    // Reset flag tidur besok pagi
    if(h === '06') sleepNotified = false;

    // Reminder Besok 18:45
    if(h === '18' && m === '45' && !tomorrowNotified) {
        sendNotification("Cek Jadwal Besok! 📅", "Siapkan buku dan perlengkapan untuk besok.");
        tomorrowNotified = true;
    }
    if(h === '19') tomorrowNotified = false;
}

function handleLogout() {
    if(confirm("Keluar aplikasi?")) {
        db.logout();
        window.location.href = 'index.html';
    }
}

// --- Init Calls ---
setInterval(updateClock, 1000);
updateClock();
renderReminders();
loadSholat();
