const socket = io();

const messagesDiv = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

// Tải lịch sử tin nhắn
socket.on('load_messages', (messages) => {
    messages.forEach(({ username, message, timestamp }) => {
        const time = new Date(timestamp).toLocaleTimeString();
        const msgDiv = document.createElement('div');
        msgDiv.textContent = `[${time}] ${username}: ${message}`;
        messagesDiv.appendChild(msgDiv);
    });
    scrollToBottom();
});

// Hiển thị tin nhắn mới
socket.on('chat_message', ({ username, message, timestamp }) => {
    const time = new Date(timestamp).toLocaleTimeString();
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `[${time}] ${username}: ${message}`;
    messagesDiv.appendChild(msgDiv);
});


let user = "Ẩn danh";
// Gửi tin nhắn
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username =  user;
    if (input.value) {
        socket.emit('chat_message', { username, message: input.value });
        input.value = '';
        scrollToBottom();
        document.querySelector("#send").disabled = true;
        setTimeout(()=>{
            document.querySelector("#send").disabled = false;
        }, 1000 *(Math.random() * (3 - 1) + 1))
    }
});


//check cookie, nếu có thì lấy tên làm user, nếu không thì yêu cầu nhập rồi lấy cookie làm user
// Hàm để lấy giá trị cookie theo tên
function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return "Ẩn danh"; // Trả về null nếu không tìm thấy
}

// Hàm để đặt cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Thời gian hết hạn
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
}

window.onload = () => {
    user = getCookie('user');
    if (!user || user == "Ẩn danh") {
        // Hiển thị prompt nếu cookie 'user' chưa tồn tại
        const userName = prompt("Enter your name");
        if (userName) {
            // Lưu cookie với tên đã nhập và thời hạn 7 ngày
            setCookie('user', userName, 7);
            alert(`Xin chào, ${userName}!`);
        } else {
            alert("Can't use empty name.");
            document.querySelector("#send").disabled = true;  
        }
    } else {
        alert(`Chào mừng trở lại, ${user}!`);
    }
    
}

function scrollToBottom() {
    const messagesDiv = document.querySelector("#messages");
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}