const startBtn = document.getElementById('start-btn');
const gameDiv = document.getElementById('game');
const timerEl = document.getElementById('timer');
const abilityImage = document.getElementById('ability-image'); // Знаходимо елемент зображення
const abilityNameElement = document.getElementById('ability-name'); // Знаходимо елемент для назви
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
const accuracyText = document.getElementById("accuracy-text");
const gameModeButtons = document.querySelectorAll('.game-mode-btn');
const hideNameModeBtn = document.getElementById('hide-name-mode'); // Приховування назви
const grayscaleModeBtn = document.getElementById('grayscale-mode'); // Чорно-біле
const fastModeBtn = document.getElementById('fast-mode'); // Швидкий режим
const fastTimer = document.getElementById('fast-timer'); // Таймер для швидкого режиму

// Початковий час для таймера
const INITIAL_TIME = 10; 

let charactersData = [];
let currentAbility = null;
let currentStreak = 0;
let pastStreak = 0; // змінна для зберігання минулої череди
let bestStreak = 0;
let timer = null;
let timeLeft = 10; // 
let startTime = null;
// Перевірка відповіді
let selectedAbility = null;
// Змінні для підрахунку відповідей
let correctAnswers = 0; 
let totalAnswers = 0;
// Режими гри / Швидкий режим
let isTimeLimitedMode = false; // Чи активний режим з обмеженням часу

let limitedTimeLeft = 10; // Кількість секунд для відповіді
// Таймер
let isFastModeEnabled = false; // Відстеження стану режиму швидкої гри / Початковий стан
let countdownInterval = null; // Інтервал для таймера
let timerInterval; // Глобальна змінна для збереження інтервалу
//let gameTimer = null; // прибрати?


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

// Додаємо обробник кліку для кожної кнопки
gameModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Перемикаємо клас активного режиму
    button.classList.toggle('active-mode');
  });
});

// Функція для приховування назви вміння режиму
let isNameHidden = false;
hideNameModeBtn.addEventListener('click', () => {
  isNameHidden = !isNameHidden;
  hideNameModeBtn.classList.toggle('active', isNameHidden);

  // Оновлюємо відображення назви залежно від режиму
  if (isNameHidden) {
    abilityNameElement.textContent = ''; // Приховуємо назву
  } else {
    abilityNameElement.textContent = currentAbility?.name || ''; // Відображаємо, якщо є активна здібність
  }
});

// Функція для чорно-білого режиму
let isGrayscale = false;
grayscaleModeBtn.addEventListener('click', () => {
  isGrayscale = !isGrayscale;
  abilityImage.style.filter = isGrayscale ? 'grayscale(100%)' : 'none'; // Додаємо/знімаємо ефект
  grayscaleModeBtn.classList.toggle('active', isGrayscale);
});

// Функція для зупинки таймера
function stopGameTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval); // Зупиняємо інтервал
    countdownInterval = null;
  }
}

// Функція для запуску/зупинки швидкого режиму гри
function toggleFastMode(enableFastMode, reset = false) {
  isFastModeEnabled = enableFastMode; // Встановлюємо стан швидкого режиму
  fastModeBtn.classList.toggle('active', enableFastMode); // Змінюємо стиль кнопки

  if (enableFastMode) {
    // Перевіряємо, чи кнопки "Грати" або блок завершення гри видимі
    if (
      !startBtn.classList.contains('hidden') || !gameOverDiv.classList.contains('hidden')
    ) {
      console.log('Швидкий режим активовано, але таймер не почнеться, поки видимі кнопки "Грати" або блок завершення гри.');
      return; // Виходимо з функції, не запускаючи таймер
    }

    stopGameTimer(); // Зупиняємо активний таймер, якщо він є

    // Фіксуємо початок відповіді у швидкому режимі
    if (reset) {
      startTime = Date.now(); // Оновлюємо початок для історії
    }

    // Ініціалізуємо таймер
    let timeLeft = reset ? 10 : parseInt(fastTimer.textContent.split('.')[0], 10) || 10;
    let milliseconds = reset ? 0 : parseInt(fastTimer.textContent.split('.')[1], 10) || 0;

    fastTimer.textContent = `${String(timeLeft).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    fastTimer.classList.remove('hidden'); // Відображаємо таймер

    // Оновлюємо таймер кожні 10 мілісекунд
    countdownInterval = setInterval(() => {
      milliseconds -= 10;

      if (milliseconds < 0) {
        milliseconds = 990; // Оновлюємо мілісекунди (990 замість 1000 для точності)
        timeLeft -= 1;
      }

      // Форматування часу
      const formattedSeconds = String(timeLeft).padStart(2, '0');
      const formattedMilliseconds = String(milliseconds / 10).padStart(2, '0');
      fastTimer.textContent = `${formattedSeconds}.${formattedMilliseconds}`;

      // Коли час закінчився
      if (timeLeft <= 0 && milliseconds <= 0) {
        stopGameTimer();
        clearInterval(countdownInterval); // Зупиняємо таймер
        fastTimer.textContent = '00.00'; // Відображаємо 00.00
        fastTimer.classList.add('hidden'); // Ховаємо таймер
        handleTimeExpired(); // Виклик обробника закінчення часу
        endGame(); // Завершуємо гру після закінчення часу
      }
    }, 10);
  } else {
    // Вимикаємо швидкий режим
    stopGameTimer(); // Зупиняємо активний таймер
    fastTimer.classList.add('hidden'); // Ховаємо таймер
    fastTimer.textContent = ''; // Очищуємо текст
  }
}

// Використання функції для швидкого режиму
fastModeBtn.addEventListener('click', () => {
  toggleFastMode(!isFastModeEnabled, true); // Перемикаємо стан швидкого режиму
});


// Обробник закінчення часу
function handleTimeExpired() {
  console.warn('Час закінчився, відповідь позначена як неправильна.');

  const timeSpent = (Date.now() - startTime) / 1000;

  // Знаходимо правильного персонажа, який має поточну здібність
  const correctCharacter = charactersData.find(char =>
    char.abilities.some(abil => abil.name === currentAbility.name)
  );

  if (!correctCharacter) {
    console.error("Помилка: не вдалося знайти правильного персонажа для поточної здібності!");
    return;
  }

  // Додаємо запис до історії з правильною відповіддю
  addHistoryRecord(
    'Не надано',
    '—', // Не обирали вміння
    correctCharacter.name, // Правильний персонаж
    currentAbility.type,   // Тип здібності
    0                      // Час не визначено
  );

  // Оновити прогрес-бар з позначкою "неправильно"
  updateAccuracyProgress(false);
}


// Модифікована функція перевірки відповіді
function checkAnswer() {
  const userAnswer = document.getElementById('answerInput').value.trim().toLowerCase();
  const correctAnswer = currentAbility.characterName.toLowerCase();

  if (userAnswer === correctAnswer) {
      correctAnswer(); // Відображення правильної відповіді
      updateStats(true); // Оновлення статистики
      loadNewAbility(); // Завантаження нової здатності
  } else {
      correctAnswer(); // Відображення неправильної відповіді
      updateStats(false); // Оновлення статистики
  }
}

// Функція для оновлення списку персонажів
function populateCharacterList(characters) {
  characterList.innerHTML = ''; // Очистити список перед заповненням
  characters.forEach(character => {
    const li = document.createElement('li');
    li.textContent = character.name;
    li.addEventListener('click', () => {
      characterInput.value = character.name; // Вибір персонажа
      hideCharacterList(); // Ховати список
      enableAbilityButtons(); // Активувати кнопки здібностей
    });
    characterList.appendChild(li);
  });
  // Відкладене встановлення прокрутки на початок
  setTimeout(() => {
    characterList.scrollTop = 0;
  }, 0); // Нульова затримка для виконання після оновлення DOM
}

//console.log(characterList); // Перевірте, чи це правильний елемент
//console.log(characterList.scrollTop); // Має бути 0 після встановлення

// Функція для відображення/приховування списку персонажів
function updateCharacterList() {
  const inputValue = characterInput.value.toLowerCase();
  const filteredCharacters = charactersData.filter(character =>
    character.name.toLowerCase().includes(inputValue)
  );

  if (filteredCharacters.length > 0) {
    populateCharacterList(filteredCharacters);
    characterList.style.display = 'block'; // Показати список
  } else {
    hideCharacterList(); // Ховати список
  }
}

// Функція для приховування списку персонажів
function hideCharacterList() {
  characterList.style.display = 'none';
}

// Слухачі подій для поля вводу персонажів
characterInput.addEventListener('input', updateCharacterList); // Оновлення списку при введенні
characterInput.addEventListener('focus', updateCharacterList); // Показ списку при фокусі
characterInput.addEventListener('blur', () => {
  setTimeout(hideCharacterList, 200); // Додаємо затримку для кліків
});
characterInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && isCharacterValid(characterInput.value)) {
    hideCharacterList(); // Ховаємо список при натисканні Enter
  }
});
characterInput.addEventListener('change', () => {
  if (isCharacterValid(characterInput.value)) {
    hideCharacterList(); // Ховаємо список при зміні значення
  }
});

// Функція для перевірки, чи введене ім'я є валідним
function isCharacterValid(characterName) {
  return charactersData.some(character => character.name.toLowerCase() === characterName.toLowerCase());
}

// Запуск гри
startBtn.addEventListener('click', () => {
  startBtn.classList.add('hidden'); // Ховаємо кнопку "Грати"
  gameDiv.classList.remove('hidden'); // Відображаємо основний блок гри
  resetGame(); // Скидаємо стан гри
  loadNewAbility(); // Завантажуємо нову здатність

  startTime = Date.now(); // Початок відліку часу для звичайного режиму

  // Увімкнення швидкого режиму, тільки якщо воно справді активне
  if (isFastModeEnabled) {
    toggleFastMode(true, true); // Увімкнення швидкого режиму з таймером
  }
});

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

  // Перевірка: не активуйте логіку швидкого режиму, якщо він вимкнений
  if (!isFastModeEnabled) {
    fastModeBtn.classList.remove('active');
    fastTimer.classList.add('hidden');
  }

  // Вибір випадкового персонажа і здібності
  const randomCharacter = charactersData[Math.floor(Math.random() * charactersData.length)];
  currentAbility = randomCharacter.abilities[
    Math.floor(Math.random() * randomCharacter.abilities.length)
  ];

  // Встановлення зображення здібності
  abilityImage.src = currentAbility.img;
  abilityImage.alt = currentAbility.name;

  // Відображення назви здібності залежно від режиму
  if (!isNameHidden) {
    abilityNameElement.textContent = currentAbility.name; // Показуємо назву
  } else {
    abilityNameElement.textContent = ''; // Приховуємо назву, якщо активний режим приховування
  }

  // Перевірка завантаження зображення
  abilityImage.onload = () => console.log('Зображення завантажено:', currentAbility.img);
  abilityImage.onerror = () => {
    console.error('Помилка завантаження зображення:', currentAbility.img);
    abilityImage.alt = 'Зображення не знайдено';
  };

  // Закриття списку персонажів
  hideCharacterList(); // Додаємо виклик функції, щоб сховати список
  
  // Початок нового раунду
  startTime = Date.now();
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
  stopGameTimer(); // Завжди зупиняємо таймер перед перевіркою відповіді

  let timeSpent = (Date.now() - startTime) / 1000; // Розрахунок часу відповіді
  if (isNaN(timeSpent) || timeSpent < 0) timeSpent = 0; // Фіксуємо, якщо значення некоректне

  const selectedCharacter = characterInput.value.trim();
  const character = charactersData.find(char => char.name === selectedCharacter);
  //const timeSpent = (Date.now() - startTime) / 1000; // Розрахунок часу відповіді

  // Знаходимо правильного персонажа, якому належить поточна здібність
  const correctCharacter = charactersData.find(char =>
    char.abilities.some(abil => abil.name === currentAbility.name)
  );

  if (!correctCharacter) {
    console.error("Помилка: не вдалося знайти правильного персонажа для поточної здібності!");
    return;
  }

  if (character) {
    const abilitiesOfType = character.abilities.filter(abil => abil.type.toLowerCase().trim() === selectedAbility.toLowerCase().trim());

    if (abilitiesOfType.length > 0 && abilitiesOfType.some(abil => abil.name === currentAbility.name)) {
      // Правильна відповідь
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;

      addHistoryRecord(
        selectedCharacter,
        selectedAbility,
        correctCharacter.name, // Тепер передаємо правильного персонажа
        currentAbility.type,
        timeSpent
      );

      updateAccuracyProgress(true); // Оновлення прогресу бару
      updateStats();

      if (isFastModeEnabled) {
        toggleFastMode(true, true); // Увімкнення швидкого режиму і скидання таймера
      }
      loadNewAbility();
    } else {
      // Неправильна відповідь
      addHistoryRecord(
        selectedCharacter,
        selectedAbility,
        correctCharacter.name, // Тепер передаємо правильного персонажа
        currentAbility.type,
        timeSpent
      );

      updateAccuracyProgress(false); // Оновлення прогресу бару
      endGame();
    }
  } else {
    // Якщо персонаж не знайдений
    addHistoryRecord(
      'Не знайдено', //selectedCharacter,
      selectedAbility,
      correctCharacter.name,
      currentAbility.type,
      timeSpent
    );
    endGame();
  }

  // Скидаємо поле вводу і стан кнопок після відповіді
  characterInput.value = '';
  abilityButtons.forEach(button => {
    button.disabled = true;
    button.classList.remove('selected');
  });
  confirmAnswerBtn.disabled = true;

  updateCharacterList();
  hideCharacterList();
});


// Завершення гри
function endGame() {
  pastStreak = currentStreak; // Оновлюємо минулу череду
  currentStreak = 0; // Скидаємо поточну череду
  clearInterval(timer); // Зупиняємо таймер

  gameDiv.classList.add('hidden');
  gameOverDiv.classList.remove('hidden');

  let incorrectAnswer;
  const selectedCharacter = characterInput.value.trim(); // Отримуємо ім'я персонажа

  if (!selectedCharacter || !selectedAbility) {
    // Якщо гравець нічого не вибрав
    incorrectAnswer = `Відповідь не була надана.`;
  } else {
    // Якщо гравець щось вибрав, перевіряємо відповідь
    const character = charactersData.find(char => char.name === selectedCharacter);
    const ability = character ? character.abilities.find(abil => abil.type === selectedAbility) : null;

    if (!ability || ability.name !== currentAbility.name) {
      incorrectAnswer = `Це не ${selectedCharacter} (${selectedAbility})`;
    } else {
      incorrectAnswer = `Відповідь була правильною!`;
    }
  }

  // Отримуємо правильного персонажа для поточної здібності
  const correctCharacter = charactersData.find(char =>
    char.abilities.some(abil => abil.name === currentAbility.name)
  );

  const correctAnswer = `Правильна відповідь: ${correctCharacter.name} (${currentAbility.type}): ${currentAbility.name}`;

  // Виведення повідомлення про завершення гри
  correctAnswerEl.innerHTML = `
    <h2>Гру завершено!</h2>
    <p>Нажаль це неправильна відповідь</p>
    <p>${incorrectAnswer}</p>
    <p>${correctAnswer}</p>
  `;

  // Додаємо картинку здібності
  const abilityImg = document.createElement('img');
  abilityImg.src = currentAbility.img;
  abilityImg.alt = currentAbility.name;
  abilityImg.classList.add('ability-image');

  correctAnswerEl.appendChild(abilityImg); // Додаємо зображення

  updateStats();
}

// Скидання гри при натисканні на кнопку "почати знову"
restartBtn.addEventListener('click', () => {
  // Сховати повідомлення про завершення гри
  gameOverDiv.classList.add('hidden');
  // Показати елементи гри
  gameDiv.classList.remove('hidden');

  // Сховати список персонажів
  hideCharacterList();

  // Скидаємо все для початку нової гри
  resetGame();
  loadNewAbility(); // Завантажуємо нову здібність
  
  // Увімкнення швидкого режиму, тільки якщо воно справді активне
  if (isFastModeEnabled) {
    toggleFastMode(true, true); // Увімкнення швидкого режиму з таймером
  }
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

  // Оновлюємо прогрес-бар
  accuracyProgress.value = accuracy;

  // Оновлюємо відсотки
  accuracyPercentage.textContent = `${accuracy}%`;

  // Оновлюємо текст правильних/загальних відповідей
  accuracyText.textContent = `${correctAnswers}/${totalAnswers}`;
}

// Функція для скидання прогресу
function resetAccuracyProgress() {
  correctAnswers = 0;
  totalAnswers = 0;
  accuracyProgress.value = 0;
  accuracyPercentage.textContent = '0%';
  accuracyText.textContent = '0/0';
}

// Історія
// Додавання запису в історію
function addHistoryRecord(selectedCharacter, selectedAbility, correctCharacter, correctAbilityType, timeSpent) {

  if (isNaN(timeSpent) || timeSpent < 0) {
    timeSpent = 0; // Якщо час некоректний, ставимо 0
  }

  const isCorrect = selectedCharacter === correctCharacter && selectedAbility === correctAbilityType; // Перевірка правильності відповіді

  // Перевіряємо, чи знайдено правильного персонажа
  const correctCharacterName = correctCharacter ? correctCharacter : "Не знайдено";

  // Отримуємо зображення здібності
  const abilityImage = currentAbility ? currentAbility.img : "placeholder.jpg"; // Якщо немає зображення, ставимо заглушку

  
  // Створюємо контейнер для запису
  const historyRecord = document.createElement('div');
  historyRecord.className = 'history-record';
  historyRecord.style.border = `2px solid ${isCorrect ? 'green' : 'red'}`;
  historyRecord.style.padding = '10px';
  historyRecord.style.marginBottom = '5px';
  historyRecord.style.display = 'flex';
  historyRecord.style.alignItems = 'center';

  // Зображення вміння
  const abilityImageElement = document.createElement('img');
  abilityImageElement.src = abilityImage;
  abilityImageElement.alt = currentAbility ? currentAbility.name : "Unknown ability";
  abilityImageElement.classList.add('ability-image');
  abilityImageElement.style.width = '40px';
  abilityImageElement.style.height = '40px';
  abilityImageElement.style.marginTop = '0px';
  abilityImageElement.style.marginRight = '10px';
  abilityImageElement.style.marginBottom = '0px';


  // Текст відповіді
  const answerText = document.createElement('span');
  answerText.style.marginRight = '10px';

  if (isCorrect) {
    answerText.innerHTML = `${selectedCharacter} (${selectedAbility})`;
  } else {
    answerText.innerHTML = `<s>${selectedCharacter} (${selectedAbility})</s> → ${correctCharacterName} (${correctAbilityType})`;
  }

  // Час відповіді
  const timeText = document.createElement('span');
  timeText.style.marginLeft = 'auto';
  timeText.textContent = `${timeSpent.toFixed(2)} сек`;

  // Додаємо всі елементи до запису
  historyRecord.appendChild(abilityImageElement);
  historyRecord.appendChild(answerText);
  historyRecord.appendChild(timeText);

  // Додаємо запис до таблиці історії
  const historyContainer = document.getElementById('history-container');
  
  historyContainer.prepend(historyRecord); // Додаємо зверху
  
  // historyContainer.appendChild(historyRecord);
}

// Очищення історії
clearHistoryBtn.addEventListener('click', () => {
  // Знаходимо контейнер історії
  const historyContainer = document.getElementById('history-container');
  
  if (historyContainer) {
    // Видаляємо всі записи з контейнера
    historyContainer.innerHTML = '';
  }

  resetAccuracyProgress(); // Скидаємо шкалу точності
});

// Функція для скидання гри
function resetGame() {
  hideCharacterList();
  stopGameTimer(); // Зупиняємо активний таймер
  // Скидаємо всі змінні та елементи
  currentStreak = 0;
  // pastStreak = currentStreak; // скидує минулу спробу
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
