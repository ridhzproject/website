// js/db.js

const DB_KEY = 'school_reminder_db';

// Data Jadwal Sekolah (Sesuai Request)
const SCHOOL_SCHEDULE = {
    senin: [
        { jam: "06.45-07.30", pelajaran: "Upacara" },
        { jam: "07.30-08.15", pelajaran: "PKWU" },
        { jam: "08.15-09.00", pelajaran: "PKWU" },
        { jam: "09.00-09.25", pelajaran: "Istirahat/Sholat Dhuha" },
        { jam: "09.25-10.10", pelajaran: "Matematika" },
        { jam: "10.10-10.55", pelajaran: "Matematika" },
        { jam: "10.55-11.40", pelajaran: "Matematika (TL)" },
        { jam: "11.40-12.25", pelajaran: "Matematika (TL)" },
        { jam: "12.25-12.50", pelajaran: "Istirahat/Sholat Dzuhur" },
        { jam: "12.50-13.35", pelajaran: "Biologi (TL)" },
        { jam: "13.35-14.20", pelajaran: "Biologi (TL)" },
        { jam: "14.20-15.05", pelajaran: "Bahasa Indonesia" },
        { jam: "15.05-15.50", pelajaran: "Bahasa Indonesia" }
    ],
    selasa: [
        { jam: "06.45-07.30", pelajaran: "PPKn" },
        { jam: "07.30-08.15", pelajaran: "PPKn" },
        { jam: "08.15-09.00", pelajaran: "Matematika" },
        { jam: "09.00-09.25", pelajaran: "Istirahat/Sholat Dhuha" },
        { jam: "09.25-10.10", pelajaran: "Matematika" },
        { jam: "10.10-10.55", pelajaran: "Biologi (TL)" },
        { jam: "10.55-11.40", pelajaran: "Biologi (TL)" },
        { jam: "11.40-12.25", pelajaran: "Biologi (TL)" },
        { jam: "12.25-12.50", pelajaran: "Istirahat/Sholat Dzuhur" },
        { jam: "12.50-13.35", pelajaran: "Bahasa Indonesia" },
        { jam: "13.35-14.20", pelajaran: "Bahasa Indonesia" },
        { jam: "14.20-15.05", pelajaran: "Matematika (TL)" },
        { jam: "15.05-15.50", pelajaran: "Matematika (TL)" }
    ],
    rabu: [
        { jam: "06.45-07.30", pelajaran: "Fisika (TL)" },
        { jam: "07.30-08.15", pelajaran: "Fisika (TL)" },
        { jam: "08.15-09.00", pelajaran: "Fisika (TL)" },
        { jam: "09.00-09.25", pelajaran: "Istirahat/Sholat Dhuha" },
        { jam: "09.25-10.10", pelajaran: "PAI" },
        { jam: "10.10-10.55", pelajaran: "PAI" },
        { jam: "10.55-11.40", pelajaran: "PAI" },
        { jam: "11.40-12.25", pelajaran: "Matematika (TL)" },
        { jam: "12.25-12.50", pelajaran: "Istirahat/Sholat Dzuhur" },
        { jam: "12.50-13.35", pelajaran: "Kimia (TL)" },
        { jam: "13.35-14.20", pelajaran: "Kimia (TL)" },
        { jam: "14.20-15.05", pelajaran: "Sejarah" },
        { jam: "15.05-15.50", pelajaran: "Sejarah" }
    ],
    kamis: [
        { jam: "06.45-07.30", pelajaran: "Kimia (TL)" },
        { jam: "07.30-08.15", pelajaran: "Kimia (TL)" },
        { jam: "08.15-09.00", pelajaran: "Kimia (TL)" },
        { jam: "09.00-09.25", pelajaran: "Istirahat/Sholat Dhuha" },
        { jam: "09.25-10.10", pelajaran: "PJOK" },
        { jam: "10.10-10.55", pelajaran: "PJOK" },
        { jam: "10.55-11.40", pelajaran: "Bahasa Inggris" },
        { jam: "11.40-12.25", pelajaran: "Bahasa Inggris" },
        { jam: "12.25-12.50", pelajaran: "Istirahat/Sholat Dzuhur" },
        { jam: "12.50-13.35", pelajaran: "Bahasa Inggris" },
        { jam: "13.35-14.20", pelajaran: "PJOK" },
        { jam: "14.20-15.05", pelajaran: "Seni Budaya" },
        { jam: "15.05-15.50", pelajaran: "Seni Budaya" }
    ],
    jumat: [
        { jam: "06.45-07.30", pelajaran: "Bahasa Jawa" },
        { jam: "07.30-08.15", pelajaran: "Bahasa Jawa" },
        { jam: "08.15-09.00", pelajaran: "Bimbingan Konseling" },
        { jam: "09.00-09.30", pelajaran: "Istirahat/Sholat Dhuha" },
        { jam: "09.30-10.15", pelajaran: "Fisika (TL)" },
        { jam: "10.15-11.00", pelajaran: "Fisika (TL)" }
    ]
};

const QUOTES = [
    "Semangat belajar! Masa depan cerah menantimu 🌟",
    "Setiap langkah kecil membawamu ke kesuksesan 💪",
    "Belajar hari ini, sukses esok hari 📚✨",
    "Jangan menyerah, proses tidak akan mengkhianati hasil 🌈",
    "Sholat adalah tiang agama, jangan lupa ya! 🕌"
];

class Database {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEY)) {
            const initialData = {
                user: null,
                reminders: [],
                sholat_settings: {
                    city_id: "1609", // Default Kediri (sebagai contoh)
                    city_name: "KAB. KEDIRI"
                }
            };
            localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(DB_KEY));
    }

    saveData(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    login(username) {
        const data = this.getData();
        data.user = { name: username, loginTime: new Date() };
        this.saveData(data);
    }

    logout() {
        const data = this.getData();
        data.user = null;
        this.saveData(data);
    }

    addReminder(reminder) {
        const data = this.getData();
        reminder.id = Date.now().toString();
        data.reminders.push(reminder);
        this.saveData(data);
    }

    deleteReminder(id) {
        const data = this.getData();
        data.reminders = data.reminders.filter(r => r.id !== id);
        this.saveData(data);
    }
    
    updateSholatCity(id, name) {
        const data = this.getData();
        data.sholat_settings.city_id = id;
        data.sholat_settings.city_name = name;
        this.saveData(data);
    }
}

const db = new Database();
