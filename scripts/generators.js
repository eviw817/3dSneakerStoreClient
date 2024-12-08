// Random Shoe Title
const adjectives = [
    "Amazing", "Awesome", "Beautiful", "Brilliant", "Charming", "Cool", "Dazzling", "Elegant", "Excellent", "Fabulous",
    "Fantastic", "Gorgeous", "Graceful", "Impressive", "Incredible", "Lovely", "Magnificent", "Marvelous", "Outstanding", "Perfect",
    "Phenomenal", "Remarkable", "Sensational", "Spectacular", "Splendid", "Stunning", "Superb", "Terrific", "Wonderful", "Wondrous",
    "Radiant", "Vibrant", "Stylish", "Trendy", "Unique", "Vivid", "Classy", "Dapper", "Posh", "Snazzy"
];

export function getRandomAdjectives() {
    const shuffled = adjectives.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2).join(' ') + ' Shoe';
}

export function calculatePrice() {
    let basePrice = 50;
    let materialPrice = document.querySelector('.material-button.active') ? 15 : 0;
    let colorPrice = document.querySelector('.color-circle[style*="border: 2px solid rgb(105, 255, 71);"]') ? 10 : 0;
    let namePrice = document.getElementById('shoeName').value ? 20 : 0;
    let totalPrice = basePrice + materialPrice + colorPrice + namePrice;
    document.querySelector('.title h2').textContent = `€${totalPrice}`;
}