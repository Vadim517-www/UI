// Функція для отримання всіх користувачів
async function getUsers() {
    try {
        const response = await axios.get('http://localhost:3000/users');
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
        const userResponse = await axios.get(`http://localhost:3000/users/${userId}`);
        const friendsResponse = await axios.get(`http://localhost:3000/users/${userId}/friends`);
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
        const allUsers = await axios.get('http://localhost:3000/users');
        const friends = await axios.get(`http://localhost:3000/users/${userId}/friends`);
        const nonFriends = allUsers.data.filter(user => 
            user.id !== userId && !friends.data.some(friend => friend.id === user.id)
        );

        if (nonFriends.length > 0) {
            const friendId = nonFriends[0].id; // Для простоти беремо першого
            await axios.post(`http://localhost:3000/users/${userId}/friends`, { friendId });
            alert('Second one added!');
            showUserDetails(userId); // Оновлюємо деталі
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
        const friends = await axios.get(`http://localhost:3000/users/${userId}/friends`);
        if (friends.data.length > 0) {
            const friendId = friends.data[0].id; // Для простоти видаляємо першого
            await axios.delete(`http://localhost:3000/users/${userId}/friends/${friendId}`);
            alert('The second one is deleted!');
            showUserDetails(userId); // Оновлюємо деталі
        } else {
            alert('User has no friends to delete.');
        }
    } catch (error) {
        console.error('Error deleting a friend:', error);
    }
}

// Завантаження користувачів при запуску сторінки
window.onload = getUsers;