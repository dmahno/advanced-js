'use strict';

///////////////////////////////////////////////////////////////////////////
/////////////////////////////////ЗАДАНИЕ 1/////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// Написать функцию, которая принимает объект
// и возвращает все свойства и символы как в самом объекте,
// так и во всей его цепочке прототипов.

// ------------- Вариант через цикл do while

function allKeysAndSymbols(object) {
  const properties = [];
  do {
    Object.getOwnPropertyNames(object).forEach((property) => {
      if (properties.indexOf(property)) {
        properties.push(property);
      }
    });
  } while ((object = Object.getPrototypeOf(object)));
  return properties;
}
allKeysAndSymbols({}); // ["constructor", "__defineGetter__", "__defineSetter__", "hasOwnProperty", ... ]
console.log(allKeysAndSymbols({ a: '2' }));

// -------------- Вариант без цикла do while (с разбором) лучше читается (чем проще, тем лучше читать и поддерживать)

function allKeysAndSymbols(object) {
  const properties = [];
  // создаем прототип от объекта object (через метод объекта getPrototypeOf)
  object = Object.getPrototypeOf(object);
  // возвращаем массив из свойств прототипа объекта object и для каждого свойства property вставляем полученные элементы в массив properties,
  Object.getOwnPropertyNames(object).forEach((property) => {
    // вставляет полученные элементы в массив properties,
    properties.push(property);
  });
  return properties;
}

allKeysAndSymbols({}); // ["constructor", "__defineGetter__", "__defineSetter__", "hasOwnProperty", ... ]
console.log(allKeysAndSymbols({ a: '2' }));

///////////////////////////////////////////////////////////////////////////
/////////////////////////////////ЗАДАНИЕ 2/////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// // in, который игнорирует свойства прототипа
// // Написать прокси-объект, для которого оператор
// // in вернет истину только в том случает,
// // когда свойство находится в самом объекте, но не в его прототипе.

const proto = { value: 42 };
// создаем новый объект с указанным объектом прототипа и его свойствами
const object = Object.create(proto);

// определяем свойство year со значением 2020 для нового объекта прототипа
Object.defineProperty(object, 'year', {
  value: 2020,
  // позволяем перезаписывать данное значение
  writable: true,
  // позволяем удалять/изменять данное св-во
  configurable: true,
  // свойство может быть просмотрено/перечисленно в циклах
  enumerable: false,
});

// Создаём новый символ с описанием (именем bazzinga)
const symbol = Symbol('bazzinga');
// Созданному сиволу присваеваем значение 42 и вставляем в наш объект
object[symbol] = 42;

// без proxy
console.log('value' in object); // true
console.log('year' in object); // true
console.log(symbol in object); // true

// объявляем конфигуратор Прокси
const handler = {
  // Внизу в clg используется оператор in, для того, чтобы проверить, что некоторые значения находится в указанном месте (объекте).
  // Ловушка has перехватывает вызовы in
  // target - это оригинальный объект, который передавался первым аргументом в конструктор new Proxy
  // property - имя свойства
  has(target, property) {
    // возвращаем свойство объекта target
    return target.hasOwnProperty(property);
  },
};
// Объект Proxy «оборачивается» вокруг другого объекта и перехватывает разные действия с ним, например чтение/запись свойств.
// передаем объект и передаем ловушку handler
const proxy = new Proxy(object, handler);

// с proxy
console.log('value' in proxy); // false
console.log('year' in proxy); // true
console.log(symbol in proxy); // true

///////////////////////////////////////////////////////////////////////////
/////////////////////////////////ЗАДАНИЕ 3/////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// asyncExecutor
// Написать функцию,
// которая позволит использовать внутри генератора асинхронные вызовы.
// Реализация на Promise, async/await использовать запрещено.

function asyncExecutor(generator) {
  // вызываем специальную функцию execute, которая запускает генератор,
  // последовательными вызовами next получает из него промисы – один за другим
  // и, когда очередной промис выполнится, возвращает его результат в генератор следующим next
  execute(generator());
  // передаем 2 параметра функции execute genData, callData
  const execute = (genData, callData) => {
    // делаем деструктуризацию переданных параметровв callData по средствам next
    const { value, finished } = genData.next(callData);
    // если finished true возвращаем получившиеся значения функции
    if (finished) return;
    // или продолжаем вызывать промис передавая текущую функцию.
    value.then((callData) => execute(genData, callData));
  };
}

// тесты
const ID = 42;
const delayMS = 1000;

function getId() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ID);
    }, delayMS);
  });
}

function getDataById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      id === ID ? resolve('🍎') : reject('💥');
    }, delayMS);
  });
}

asyncExecutor(function* () {
  console.time('Time');

  const id = yield getId();
  const data = yield getDataById(id);
  console.log('Data', data);

  console.timeEnd('Time');
});
