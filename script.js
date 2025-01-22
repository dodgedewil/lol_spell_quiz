const startBtn = document.getElementById('start-btn');
const gameDiv = document.getElementById('game');
const timerEl = document.getElementById('timer');
const abilityImage = document.getElementById('ability-image');
const characterInput = document.getElementById('character-input');
const characterList = document.getElementById('characters-list');
const abilityButtons = document.querySelectorAll('.ability-btn');
const confirmAnswerBtn = document.getElementById('confirm-answer-btn');
const currentStreakEl = document.getElementById('current-streak');
const bestStreakEl = document.getElementById('best-streak');
const pastStreakEl = document.getElementById('past-streak'); // елемент для відображення минулої череди
const historyTable = document.querySelector('#history-table tbody');
const gameOverDiv = document.getElementById('game-over');
const correctAnswerEl = document.getElementById('correct-answer');
const restartBtn = document.getElementById('restart-btn');
const clearInputBtn = document.getElementById('clear-input-btn'); // кнопка очищення поля вводу
const clearHistoryBtn = document.getElementById('clear-history-btn'); // кнопка очищення історії
const accuracyProgress = document.getElementById('accuracy-progress'); // прогрес-бар / шкала
const accuracyPercentage = document.getElementById('accuracy-percentage'); // прогрес-бар / %


let charactersData = [];
let currentAbility = null;
let currentStreak = 0;
let pastStreak = 0; // змінна для зберігання минулої череди
let bestStreak = 0;
let timer = null;
let timeLeft = 600; // 10 хвилин (600 секунд)
let startTime = null;
// Перевірка відповіді
let selectedAbility = null;
// Змінні для підрахунку відповідей
let correctAnswers = 0; 
let totalAnswers = 0;

//
console.log('charactersData:', charactersData);
characterInput.addEventListener('input', () => {
  console.log('charactersData у валідації:', charactersData);
});


// Завантаження JSON
fetch('abilities.json')
  .then(response => response.json())
  .then(data => {
    charactersData = data.characters;
    populateCharacterList(charactersData);
    console.log('Дані завантажені успішно:', charactersData);
  })
  .catch(err => console.error('Помилка завантаження abilities.json:', err));

// Функція для оновлення списку персонажів / Заповнення списку персонажів
function populateCharacterList(characters) {
  characterList.innerHTML = ''; // Очистити список перед заповненням
  console.log('Додаємо персонажів до списку:', characters);
  characters.forEach(character => {
    const li = document.createElement('li');
    li.textContent = character.name;
    li.addEventListener('click', () => {
      characterInput.value = character.name; // Вибір персонажа
      characterList.style.display = 'none'; // Ховати список
      enableAbilityButtons(); // Активувати кнопки здібностей
    });
    characterList.appendChild(li);
  });
}

// Список персонажів оновлюється динамічно залежно від введеного тексту
characterInput.addEventListener('input', () => {
  const inputValue = characterInput.value.toLowerCase();
  const filteredCharacters = charactersData.filter(character =>
    character.name.toLowerCase().includes(inputValue)
  );
  // Показуємо список, якщо є збіги та введення ще не є повним ім'ям персонажа
  if (filteredCharacters.length > 0 && inputValue) {
    populateCharacterList(filteredCharacters);
    characterList.style.display = 'block'; // Показати список
  } else {
    characterList.style.display = 'none'; // Ховати список, якщо немає збігів
  }
});

// Приховувати список при втраті фокусу
characterInput.addEventListener('blur', () => {
  // Додаємо невелику затримку, щоб кліки по списку не закривали його передчасно
  setTimeout(() => {
    characterList.style.display = 'none'; // Ховаємо список
  }, 200);
});

// Показувати список при повторному фокусі
characterInput.addEventListener('focus', () => {
  const inputValue = characterInput.value.toLowerCase();
  const filteredCharacters = charactersData.filter(character =>
    character.name.toLowerCase().includes(inputValue)
  );

  if (filteredCharacters.length > 0) {
    populateCharacterList(filteredCharacters);
    characterList.style.display = 'block'; // Показуємо список
  }
});

// Приховати список після завершення введення (натискання Enter)
characterInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && isCharacterValid(characterInput.value)) {
    characterList.style.display = 'none'; // Ховаємо список, якщо ім'я валідне
  }
});

// Приховати список після вибору значення вручну
characterInput.addEventListener('change', () => {
  if (isCharacterValid(characterInput.value)) {
    characterList.style.display = 'none'; // Ховаємо список, якщо ім'я валідне
  }
});

// Функція для перевірки, чи введене ім'я є валідним
function isCharacterValid(characterName) {
  return charactersData.some(character => character.name.toLowerCase() === characterName.toLowerCase());
}

// Запуск гри
startBtn.addEventListener('click', () => {
  startBtn.classList.add('hidden');
  gameDiv.classList.remove('hidden');
  resetGame();
  loadNewAbility();
  startTimer();
});

// Запуск таймера
function startTimer() {
  clearInterval(timer);
  timeLeft = 600; // 10 хвилин
  timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
    timeLeft--;
  }, 1000);
}


// Очищення тексту
clearInputBtn.addEventListener('click', () => {
  // Очищення поля вводу
  characterInput.value = '';

  // Скидання стану кнопок здібностей
  abilityButtons.forEach(button => {
    button.disabled = true; // Вимикаємо кнопки здібностей
    button.classList.remove('selected'); // Видаляємо виділення
  });

  // Скидання стану кнопки "Підтвердити"
  confirmAnswerBtn.disabled = true; // Робимо кнопку неактивною
});

// Завантаження нового вміння
function loadNewAbility() {
  if (charactersData.length === 0) {
    console.error('Дані персонажів не завантажені.');
    return;
  }
  const randomCharacter =
    charactersData[Math.floor(Math.random() * charactersData.length)];
  currentAbility =
    randomCharacter.abilities[
      Math.floor(Math.random() * randomCharacter.abilities.length)
    ];
  abilityImage.src = currentAbility.img;
  abilityImage.alt = currentAbility.name;

  // Перевірка завантаження зображення
  abilityImage.onload = () => console.log('Зображення завантажено:', currentAbility.img);
  abilityImage.onerror = () => {
    console.error('Помилка завантаження зображення:', currentAbility.img);
    abilityImage.alt = 'Зображення не знайдено';
  };

  startTime = Date.now(); // Початок нового раунду
  
}


// Обробка натискання на кнопки здібностей
abilityButtons.forEach(button => {
  button.addEventListener('click', event => {
    // Видаляємо вибір зі всіх кнопок
    abilityButtons.forEach(btn => btn.classList.remove('selected'));
    // Додаємо вибір до натиснутої кнопки
    event.target.classList.add('selected');

    // Зберігаємо вибрану здібність
    selectedAbility = event.target.dataset.ability;
    
    // Активуємо кнопку "Підтвердити", якщо вибрано здібність
    confirmAnswerBtn.disabled = !selectedAbility;
  });
});

// Функція для перевірки, чи введений персонаж є в списку
function isCharacterValid(characterName) {
  return charactersData.some(character => character.name.toLowerCase() === characterName.toLowerCase());
}

// Обробник для введення персонажа // Обробка введення імені персонажа
characterInput.addEventListener('input', () => {
  const characterName = characterInput.value.trim(); // Отримуємо введене ім'я персонажа

  if (isCharacterValid(characterName)) {
      enableAbilityButtons(); // Якщо персонаж валідний, активуємо кнопки здібностей
  } else {
      disableAbilityButtons(); // Інакше деактивуємо кнопки здібностей
  }
});

// Функції для активації та деактивації кнопок здібностей
function enableAbilityButtons() {
  abilityButtons.forEach(button => {
      button.disabled = false; // Розблоковуємо кнопки
  });
}

function disableAbilityButtons() {
  abilityButtons.forEach(button => {
      button.disabled = true; // Блокуємо кнопки
  });
}


// Підтвердження відповіді
confirmAnswerBtn.addEventListener('click', () => {
  const selectedCharacter = characterInput.value.trim();
  const character = charactersData.find(char => char.name === selectedCharacter);

  if (character) {
    const abilitiesOfType = character.abilities.filter(abil => abil.type.toLowerCase().trim() === selectedAbility.toLowerCase().trim());

  if (abilitiesOfType.length > 0 && abilitiesOfType.some(abil => abil.name === currentAbility.name)) {
    currentStreak++;
    if (currentStreak > bestStreak) bestStreak = currentStreak;
    addHistoryRecord(`✔️ ${selectedCharacter} (${selectedAbility})`);
    updateAccuracyProgress(true); // Оновлення прогресу бару
    updateStats();
    loadNewAbility();
  } else {
  addHistoryRecord(`❌ ${selectedCharacter} (${selectedAbility})`);
  updateAccuracyProgress(false); // Оновлення прогресу бару
  endGame();
  }
  } else {
    endGame();
  }

  // Скидаємо поле вводу і стан кнопок після відповіді
  characterInput.value = '';
  abilityButtons.forEach(button => {
    button.disabled = true; // Вимикаємо кнопки здібностей
    button.classList.remove('selected'); // Видаляємо виділення
  });
  confirmAnswerBtn.disabled = true; // Вимикаємо кнопку "Підтвердити"
});

// Завершення гри
function endGame() {
  pastStreak = currentStreak; // Оновлюємо минулу череду
  currentStreak = 0; // скидаємо поточну череду
  clearInterval(timer); // зупинити таймер
  gameDiv.classList.add('hidden');
  gameOverDiv.classList.remove('hidden');

  // Перевірка, чи була надана відповідь
  let incorrectAnswer;
  if (!selectedAbility) {
    // Якщо відповідь не вибрана
    incorrectAnswer = `Відповідь не була надана.`;
  } else {
    // Якщо відповідь вибрана, перевіряємо її на правильність
    const selectedCharacter = characterInput.value.trim();
    const character = charactersData.find(char => char.name === selectedCharacter);
    const ability = character ? character.abilities.find(abil => abil.type === selectedAbility) : null;

    if (!ability || ability.name !== currentAbility.name) {
      incorrectAnswer = `Це не ${selectedCharacter} (${selectedAbility})`;
    } else {
      incorrectAnswer = `Відповідь була правильною!`;
    }
  }

  const correctCharacter = charactersData.find(char =>
    char.abilities.some(abil => abil.name === currentAbility.name)
  );

  const correctAnswer = `Правильна відповідь: ${correctCharacter.name} (${currentAbility.type}): ${currentAbility.name}`;

  // Виведення невірної та правильної відповідей
  correctAnswerEl.innerHTML = `
    <h2>Гру завершено!</h2>
    <p>Нажаль це неправильна відповідь</p>
    <p>${incorrectAnswer}</p>
    <p>${correctAnswer}</p>
  `;

  // Додаємо картинку вміння
  const abilityImg = document.createElement('img');
  abilityImg.src = currentAbility.img;
  abilityImg.alt = currentAbility.name;
  abilityImg.classList.add('ability-image');

  // Додаємо картинку під правильну відповідь
  correctAnswerEl.appendChild(abilityImg);

  updateStats();
}


// Скидання гри при натисканні на кнопку "почати знову"
restartBtn.addEventListener('click', () => {
  // Сховати повідомлення про завершення гри
  gameOverDiv.classList.add('hidden');
  // Показати елементи гри
  gameDiv.classList.remove('hidden');
  
  // Скидаємо все для початку нової гри
  resetGame();
  loadNewAbility(); // Завантажуємо нову здібність
  startTimer(); // Перезапускаємо таймер
});

// Оновлення статистики
function updateStats() {
  currentStreakEl.textContent = currentStreak;
  bestStreakEl.textContent = bestStreak;
  pastStreakEl.textContent = pastStreak; // Виводимо минулу череду
}

// Функція для оновлення прогрес-бару
function updateAccuracyProgress(isCorrect) {
  totalAnswers++; // Збільшуємо загальну кількість відповідей
  if (isCorrect) correctAnswers++; // Збільшуємо кількість правильних відповідей

  // Обчислення точності
  const accuracy = Math.round((correctAnswers / totalAnswers) * 100);

  // Оновлюємо прогрес-бар і відсотки
  accuracyProgress.value = accuracy;
  accuracyPercentage.textContent = `${accuracy}%`;
}

// Функція для скидання прогресу
function resetAccuracyProgress() {
  correctAnswers = 0;
  totalAnswers = 0;
  accuracyProgress.value = 0;
  accuracyPercentage.textContent = '0%';
}

// Історія
function addHistoryRecord(answer) {
  const timeSpent = (Date.now() - startTime) / 1000; // Обчислюємо час у секундах з мілісекундами
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${historyTable.rows.length + 1}</td>
    <td>${answer}</td>
    <td>${timeSpent.toFixed(2)} сек</td> <!-- Форматуємо до 2 десяткових -->
  `;
  historyTable.appendChild(row);
  console.log('Час, витрачений на відповідь:', timeSpent.toFixed(2));
}

// Очищення історії
clearHistoryBtn.addEventListener('click', () => {
  historyTable.innerHTML = ''; // Видаляє всі рядки таблиці
  resetAccuracyProgress();    // Скидаємо шкалу точності
});

// Функція для скидання гри
function resetGame() {
  // Скидаємо всі змінні та елементи
  currentStreak = 0;
  // pastStreak = currentStreak; // скидує минулу спробу
  timeLeft = 600;
  currentStreakEl.textContent = currentStreak;
  bestStreakEl.textContent = bestStreak;
  pastStreakEl.textContent = pastStreak;
  // historyTable.innerHTML = ''; // Очищуємо історію після кожної гри
  selectedAbility = null; // Скидаємо вибрану здібність
  characterInput.value = ''; // Очищаємо поле вводу
  abilityButtons.forEach(button => button.disabled = true); // Вимикаємо кнопки до введення імені
  abilityButtons.forEach(button => button.classList.remove('selected')); // Видаляємо виділення
  confirmAnswerBtn.disabled = true; // Робимо кнопку "Підтвердити" неактивною
  abilityImage.src = ''; // Очищаємо зображення
  abilityImage.alt = ''; // Очищаємо alt для зображення
}
