// Налаштування авторизації
const API_URL = 'http://localhost:3000';
let authToken = localStorage.getItem('token') || null;

function setAuthHeader() {
    return authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
}

// Функція для отримання всіх користувачів
async function getUsers() {
    try {
        const response = await axios.get(`${API_URL}/users`, setAuthHeader());
        displayUsers(response.data);
    } catch (error) {
        console.error('Error receiving users:', error);
    }
}

// Функція для відображення списку користувачів
function displayUsers(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '<h2>List of users</h2>';
    const ul = document.createElement('ul');
    ul.className = 'list-group';
    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `${user.name} (Age: ${user.age}) <button class="btn btn-primary btn-sm" onclick="showUserDetails(${user.id})">Details</button>`;
        ul.appendChild(li);
    });
    usersList.appendChild(ul);
}

// Функція для показу деталей користувача
async function showUserDetails(userId) {
    try {
        const userResponse = await axios.get(`${API_URL}/users/${userId}`, setAuthHeader());
        const friendsResponse = await axios.get(`${API_URL}/users/${userId}/friends`, setAuthHeader());
        displayUserDetails(userResponse.data, friendsResponse.data);
    } catch (error) {
        console.error('Error receiving parts:', error);
    }
}

// Функція для відображення деталей користувача та друзів
function displayUserDetails(user, friends) {
    const userDetails = document.getElementById('user-details');
    userDetails.innerHTML = `
        <h2>${user.name}</h2>
        <p>Age: ${user.age}</p>
        <h3>Friends:</h3>
        <ul class="list-group mb-3">
            ${friends.length > 0 ? friends.map(friend => `<li class="list-group-item">${friend.name}</li>`).join('') : '<li class="list-group-item">No friends</li>'}
        </ul>
        <button class="btn btn-success me-2" onclick="addFriend(${user.id})">Add a friend</button>
        <button class="btn btn-danger" onclick="removeFriend(${user.id})">Vidaliti a friend</button>
    `;
}

// Функція для додавання друга
async function addFriend(userId) {
    try {
        const allUsers = await axios.get(`${API_URL}/users`, setAuthHeader());
        const friends = await axios.get(`${API_URL}/users/${userId}/friends`, setAuthHeader());
        const nonFriends = allUsers.data.filter(user => 
            user.id !== userId && !friends.data.some(friend => friend.id === user.id)
        );

        if (nonFriends.length > 0) {
            const friendId = nonFriends[0].id;
            await axios.post(`${API_URL}/users/${userId}/friends`, { friendId }, setAuthHeader());
            alert('Second one added!');
            showUserDetails(userId);
        } else {
            alert('No users available to add.');
        }
    } catch (error) {
        console.error('Error adding a friend:', error);
    }
}

// Функція для видалення друга
async function removeFriend(userId) {
    try {
        const friends = await axios.get(`${API_URL}/users/${userId}/friends`, setAuthHeader());
        if (friends.data.length > 0) {
            const friendId = friends.data[0].id;
            await axios.delete(`${API_URL}/users/${userId}/friends/${friendId}`, setAuthHeader());
            alert('The second one is deleted!');
            showUserDetails(userId);
        } else {
            alert('User has no friends to delete.');
        }
    } catch (error) {
        console.error('Error deleting a friend:', error);
    }
}

// Аутентифікація
async function register() {
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    if (!username || !password) return alert('Please enter username and password');

    try {
        await axios.post(`${API_URL}/auth/register`, { username, password });
        alert('Registration successful. You can now login.');
    } catch (error) {
        alert('Registration failed: ' + error.response?.data?.message || error.message);
    }
}

async function login() {
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    if (!username || !password) return alert('Please enter username and password');

    try {
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });
        authToken = response.data.token;
        localStorage.setItem('token', authToken);
        document.getElementById('auth-status').innerText = 'Logged in';
        getUsers();
    } catch (error) {
        alert('Login failed: ' + error.response?.data?.message || error.message);
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('token');
    document.getElementById('auth-status').innerText = 'Logged out';
    getUsers();
}

// Завантаження користувачів при запуску сторінки
window.onload = getUsers;