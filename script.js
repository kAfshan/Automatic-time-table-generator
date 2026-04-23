// Data Storage
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];

// DOM Elements
const subjectInput = document.getElementById('subjectInput');
const daySelect = document.getElementById('daySelect');
const timeSelect = document.getElementById('timeSelect');
const roomSelect = document.getElementById('roomSelect');
const teacherSelect = document.getElementById('teacherSelect');
const durationInput = document.getElementById('durationInput');
const colorInput = document.getElementById('colorInput');
const addBtn = document.getElementById('addBtn');

const teacherNameInput = document.getElementById('teacherNameInput');
const teacherEmailInput = document.getElementById('teacherEmailInput');
const teacherPhoneInput = document.getElementById('teacherPhoneInput');
const teacherDeptInput = document.getElementById('teacherDeptInput');
const addTeacherBtn = document.getElementById('addTeacherBtn');

const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

const timetableContainer = document.getElementById('timetableContainer');
const classList = document.getElementById('classList');
const teachersList = document.getElementById('teachersList');

// Statistics Elements
const classCount = document.getElementById('classCount');
const teacherCount = document.getElementById('teacherCount');
const roomCount = document.getElementById('roomCount');

// Tab Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
    });
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Days and Times
const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeOrder = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

// Event Listeners
addBtn.addEventListener('click', addClass);
addTeacherBtn.addEventListener('click', addTeacher);
generateBtn.addEventListener('click', generateTimetable);
downloadBtn.addEventListener('click', downloadTimetable);
printBtn.addEventListener('click', printTimetable);
clearBtn.addEventListener('click', clearAllData);
exportBtn.addEventListener('click', exportData);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', importData);

subjectInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addClass();
});

// Add Teacher Function
function addTeacher() {
    const name = teacherNameInput.value.trim();
    const email = teacherEmailInput.value.trim();
    const phone = teacherPhoneInput.value.trim();
    const dept = teacherDeptInput.value.trim();

    if (!name || !email || !dept) {
        alert('Please fill in required fields!');
        return;
    }

    const newTeacher = {
        id: Date.now(),
        name,
        email,
        phone,
        dept
    };

    teachers.push(newTeacher);
    saveToLocalStorage();
    clearTeacherInputs();
    updateTeacherSelect();
    updateTeachersList();
    updateStats();
}

function clearTeacherInputs() {
    teacherNameInput.value = '';
    teacherEmailInput.value = '';
    teacherPhoneInput.value = '';
    teacherDeptInput.value = '';
}

function updateTeacherSelect() {
    const currentValue = teacherSelect.value;
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        teacherSelect.appendChild(option);
    });
    teacherSelect.value = currentValue;
}

function updateTeachersList() {
    if (teachers.length === 0) {
        teachersList.innerHTML = '<p class="empty-message">No teachers added yet.</p>';
        return;
    }

    teachersList.innerHTML = teachers.map(teacher => `
        <div class="teacher-card">
            <button class="delete-btn" onclick="deleteTeacher(${teacher.id})"><i class="fas fa-trash"></i></button>
            <h3><i class="fas fa-user-tie"></i> ${teacher.name}</h3>
            <p><strong>Email:</strong> ${teacher.email}</p>
            <p><strong>Phone:</strong> ${teacher.phone || 'N/A'}</p>
            <p class="teacher-dept"><i class="fas fa-building"></i> ${teacher.dept}</p>
        </div>
    `).join('');
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        teachers = teachers.filter(t => t.id !== id);
        classes = classes.filter(c => c.teacherId !== id);
        saveToLocalStorage();
        updateTeacherSelect();
        updateTeachersList();
        updateClassList();
        generateTimetable();
        updateStats();
    }
}

// Add Class Function
function addClass() {
    const subject = subjectInput.value.trim();
    const day = daySelect.value;
    const time = timeSelect.value;
    const room = roomSelect.value;
    const teacherId = teacherSelect.value;
    const duration = parseInt(durationInput.value) || 60;
    const color = colorInput.value;

    if (!subject || !day || !time || !room || !teacherId) {
        alert('Please fill in all fields!');
        return;
    }

    const isDuplicate = classes.some(c => c.day === day && c.time === time && c.room === room);
    if (isDuplicate) {
        alert('This time slot and room combination is already taken!');
        return;
    }

    const teacher = teachers.find(t => t.id === parseInt(teacherId));

    const newClass = {
        id: Date.now(),
        subject,
        day,
        time,
        room,
        teacherId: parseInt(teacherId),
        teacherName: teacher.name,
        duration,
        color
    };

    classes.push(newClass);
    saveToLocalStorage();
    clearInputs();
    updateClassList();
    generateTimetable();
    updateStats();
}

function clearInputs() {
    subjectInput.value = '';
    daySelect.value = '';
    timeSelect.value = '';
    roomSelect.value = '';
    teacherSelect.value = '';
    durationInput.value = '60';
    colorInput.value = '#667eea';
    subjectInput.focus();
}

function deleteClass(id) {
    classes = classes.filter(c => c.id !== id);
    saveToLocalStorage();
    updateClassList();
    generateTimetable();
    updateStats();
}

function updateClassList() {
    if (classes.length === 0) {
        classList.innerHTML = '<p class="empty-message">No classes added yet. Add your first class!</p>';
        return;
    }

    classList.innerHTML = classes
        .sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day) || timeOrder.indexOf(a.time) - timeOrder.indexOf(b.time))
        .map(c => `
            <div class="class-card" style="border-top-color: ${c.color};">
                <button class="delete-btn" onclick="deleteClass(${c.id})"><i class="fas fa-trash"></i></button>
                <h3><span class="color-tag" style="background: ${c.color};"></span>${c.subject}</h3>
                <p><strong>Teacher:</strong> ${c.teacherName}</p>
                <p><strong>Day:</strong> ${c.day}</p>
                <p><strong>Time:</strong> ${c.time}</p>
                <p><strong>Room:</strong> ${c.room}</p>
                <p><strong>Duration:</strong> ${c.duration} minutes</p>
            </div>
        `)
        .join('');
}

// Generate Timetable
function generateTimetable() {
    if (classes.length === 0) {
        timetableContainer.innerHTML = '<p class="empty-message">Add classes to view the schedule</p>';
        return;
    }

    const sortedClasses = [...classes].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return timeOrder.indexOf(a.time) - timeOrder.indexOf(b.time);
    });

    // Weekly view
    let weeklyHTML = '<div class="weekly-schedule">';
    daysOrder.forEach(day => {
        const dayClasses = sortedClasses.filter(c => c.day === day);
        weeklyHTML += `
            <div class="day-column">
                <div class="day-header">${day}</div>
                <div class="day-classes">
        `;
        
        if (dayClasses.length === 0) {
            weeklyHTML += '<p style="color: #999; padding: 20px 0; text-align: center;">No classes</p>';
        } else {
            dayClasses.forEach(c => {
                weeklyHTML += `
                    <div class="day-class" style="border-left-color: ${c.color};">
                        <div class="day-class-time">${c.time}</div>
                        <div class="day-class-subject">${c.subject}</div>
                        <div class="day-class-teacher">👨‍🏫 ${c.teacherName}</div>
                        <div class="day-class-room">📍 ${c.room}</div>
                    </div>
                `;
            });
        }
        
        weeklyHTML += '</div></div>';
    });
    weeklyHTML += '</div>';

    // Table view
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>📅 Day</th>
                    <th>⏰ Time</th>
                    <th>📖 Subject</th>
                    <th>👨‍🏫 Teacher</th>
                    <th>📍 Room</th>
                    <th>⏱️ Duration</th>
                </tr>
            </thead>
            <tbody>
    `;

    sortedClasses.forEach(c => {
        tableHTML += `
            <tr>
                <td><strong>${c.day}</strong></td>
                <td>${c.time}</td>
                <td><span style="color: ${c.color}; font-weight: bold;">● </span>${c.subject}</td>
                <td>${c.teacherName}</td>
                <td>${c.room}</td>
                <td>${c.duration} min</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';

    timetableContainer.innerHTML = weeklyHTML + '<hr style="margin: 30px 0; border: none; border-top: 2px solid #e9ecef;"><h3 style="margin: 20px 0;">Detailed Schedule</h3>' + tableHTML;
}

// Download as HTML
function downloadTimetable() {
    if (classes.length === 0) {
        alert('Please add some classes before downloading!');
        return;
    }

    const sortedClasses = [...classes].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return timeOrder.indexOf(a.time) - timeOrder.indexOf(b.time);
    });

    let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Timetable - ${new Date().toLocaleDateString()}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 1000px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
                h1 { text-align: center; color: #667eea; margin-bottom: 10px; }
                .date { text-align: center; color: #999; margin-bottom: 30px; }
                .week-schedule { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
                .day-col { background: #f8f9fa; border-radius: 8px; overflow: hidden; }
                .day-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: center; font-weight: bold; }
                .day-content { padding: 15px; min-height: 300px; }
                .class-item { background: white; border-left: 4px solid #667eea; padding: 12px; margin-bottom: 12px; border-radius: 6px; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                th { padding: 15px; text-align: left; font-weight: bold; }
                td { padding: 12px 15px; border-bottom: 1px solid #ddd; }
                tbody tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📚 Weekly Timetable</h1>
                <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
    `;

    // Add weekly view
    htmlContent += '<div class="week-schedule">';
    daysOrder.forEach(day => {
        const dayClasses = sortedClasses.filter(c => c.day === day);
        htmlContent += `
            <div class="day-col">
                <div class="day-header">${day}</div>
                <div class="day-content">
        `;
        
        if (dayClasses.length === 0) {
            htmlContent += '<p style="color: #999;">No classes</p>';
        } else {
            dayClasses.forEach(c => {
                htmlContent += `
                    <div class="class-item" style="border-left-color: ${c.color};">
                        <div style="font-weight: bold; color: ${c.color};">${c.time}</div>
                        <div style="font-weight: bold; margin: 5px 0;">${c.subject}</div>
                        <div style="color: #666; font-size: 0.9em;">👨‍🏫 ${c.teacherName}</div>
                        <div style="color: #999; font-size: 0.85em;">📍 ${c.room}</div>
                    </div>
                `;
            });
        }
        
        htmlContent += '</div></div>';
    });
    htmlContent += '</div>';

    // Add table
    htmlContent += `
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Room</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
    `;

    sortedClasses.forEach(c => {
        htmlContent += `
            <tr>
                <td>${c.day}</td>
                <td>${c.time}</td>
                <td>${c.subject}</td>
                <td>${c.teacherName}</td>
                <td>${c.room}</td>
                <td>${c.duration} min</td>
            </tr>
        `;
    });

    htmlContent += '</tbody></table></div></body></html>';

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
    element.setAttribute('download', `Timetable-${new Date().toISOString().split('T')[0]}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Print Timetable
function printTimetable() {
    if (classes.length === 0) {
        alert('Please add some classes before printing!');
        return;
    }

    const printWindow = window.open('', '', 'width=1000,height=700');
    printWindow.document.write(timetableContainer.innerHTML);
    printWindow.document.close();
    printWindow.print();
}

// Update Statistics
function updateStats() {
    classCount.textContent = classes.length;
    teacherCount.textContent = teachers.length;
    const uniqueRooms = new Set(classes.map(c => c.room)).size;
    roomCount.textContent = uniqueRooms;

    // Teacher Stats
    const teacherStats = {};
    classes.forEach(c => {
        teacherStats[c.teacherName] = (teacherStats[c.teacherName] || 0) + 1;
    });

    const teacherStatsDiv = document.getElementById('teacherStats');
    if (Object.keys(teacherStats).length === 0) {
        teacherStatsDiv.innerHTML = '<p class="empty-message">No data available</p>';
    } else {
        teacherStatsDiv.innerHTML = Object.entries(teacherStats)
            .map(([name, count]) => `
                <div class="stat-bar">
                    <span class="stat-bar-label">${name}</span>
                    <span class="stat-bar-value">${count} classes</span>
                </div>
            `).join('');
    }

    // Room Stats
    const roomStats = {};
    classes.forEach(c => {
        roomStats[c.room] = (roomStats[c.room] || 0) + 1;
    });

    const roomStatsDiv = document.getElementById('roomStats');
    if (Object.keys(roomStats).length === 0) {
        roomStatsDiv.innerHTML = '<p class="empty-message">No data available</p>';
    } else {
        roomStatsDiv.innerHTML = Object.entries(roomStats)
            .map(([room, count]) => `
                <div class="stat-bar">
                    <span class="stat-bar-label">${room}</span>
                    <span class="stat-bar-value">${count} classes</span>
                </div>
            `).join('');
    }

    // Day Stats
    const dayStats = {};
    daysOrder.forEach(day => {
        dayStats[day] = classes.filter(c => c.day === day).length;
    });

    const dayStatsDiv = document.getElementById('dayStats');
    dayStatsDiv.innerHTML = Object.entries(dayStats)
        .filter(([, count]) => count > 0)
        .map(([day, count]) => `
            <div class="stat-bar">
                <span class="stat-bar-label">${day}</span>
                <span class="stat-bar-value">${count} classes</span>
            </div>
        `).join('') || '<p class="empty-message">No data available</p>';

    // Time Stats
    const timeStats = {};
    timeOrder.forEach(time => {
        timeStats[time] = classes.filter(c => c.time === time).length;
    });

    const timeStatsDiv = document.getElementById('timeStats');
    timeStatsDiv.innerHTML = Object.entries(timeStats)
        .filter(([, count]) => count > 0)
        .map(([time, count]) => `
            <div class="stat-bar">
                <span class="stat-bar-label">${time}</span>
                <span class="stat-bar-value">${count} classes</span>
            </div>
        `).join('') || '<p class="empty-message">No data available</p>';
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure? This will delete ALL classes and teachers. This cannot be undone!')) {
        if (confirm('Really sure? Click OK to confirm deletion.')) {
            classes = [];
            teachers = [];
            saveToLocalStorage();
            updateClassList();
            updateTeachersList();
            updateTeacherSelect();
            generateTimetable();
            updateStats();
            alert('All data has been cleared!');
        }
    }
}

// Export Data
function exportData() {
    const data = {
        classes,
        teachers,
        exportedAt: new Date().toLocaleString()
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', `timetable-backup-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert('Data exported successfully!');
}

// Import Data
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (confirm('Import this data? Current data will be replaced.')) {
                classes = data.classes || [];
                teachers = data.teachers || [];
                saveToLocalStorage();
                updateClassList();
                updateTeachersList();
                updateTeacherSelect();
                generateTimetable();
                updateStats();
                alert('Data imported successfully!');
            }
        } catch (error) {
            alert('Error importing file. Make sure it\'s a valid JSON file.');
        }
    };
    reader.readAsText(file);
}

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('teachers', JSON.stringify(teachers));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateTeacherSelect();
    updateTeachersList();
    updateClassList();
    generateTimetable();
    updateStats();
});