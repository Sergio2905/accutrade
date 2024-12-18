if(false || !!document.documentMode){}else{
  var MAINPLERDYURL = "https://a.plerdy.com/";
var mainScriptPlerdy = document.querySelector('[src*="public/js/click/main.js"]');
var mainScriptPlerdy_host, mainScriptPlerdy_host_tracker;
if(mainScriptPlerdy){
    try{
        let mainScriptPlerdy_url = new URL(mainScriptPlerdy.src);
        if(mainScriptPlerdy_url.host){
            mainScriptPlerdy_host = mainScriptPlerdy_url.host;
        }else{
            mainScriptPlerdy_host = "a.plerdy.com";
        }
    }catch(err){
        mainScriptPlerdy_host = "a.plerdy.com";
    }

}else{
    mainScriptPlerdy_host = "a.plerdy.com";
}
if(mainScriptPlerdy_host == 'a.plerdy.com'){
    mainScriptPlerdy_host_tracker = 'https://a.plerdy.com';
    mainScriptPlerdy_host = "https://" + mainScriptPlerdy_host;
    if(typeof _suid !== 'undefined' && (_suid == 37113 ||  _suid*1 >= 95000)){
        mainScriptPlerdy_host_tracker = 'https://f.plerdy.com';
    }    
}else if(mainScriptPlerdy_host == 'test.plerdy.com'){
    mainScriptPlerdy_host_tracker = 'https://test.plerdy.com';
    mainScriptPlerdy_host = "https://" + mainScriptPlerdy_host;
}else if(mainScriptPlerdy_host == 'd.plerdy.com'){
    mainScriptPlerdy_host_tracker = 'https://d.plerdy.com';
    mainScriptPlerdy_host = "https://" + mainScriptPlerdy_host;    
}else if(mainScriptPlerdy_host == 'plerdy.loc'){
    mainScriptPlerdy_host_tracker = 'http://plerdy.loc';
    mainScriptPlerdy_host = "http://" + mainScriptPlerdy_host;
}else{
    mainScriptPlerdy_host_tracker = 'https://tracker.plerdy.com';
    mainScriptPlerdy_host = "https://" + mainScriptPlerdy_host;
}
var plerdy_config = {
   plerdy_url0 : mainScriptPlerdy_host+"/",
    plerdy_url_live : mainScriptPlerdy_host+"/",
   plerdy_url_save : mainScriptPlerdy_host_tracker+"/click/",
   plerdy_url_save_test : mainScriptPlerdy_host_tracker+"/click_test/"
};
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
        for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    }
}
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}
;(function() {
    // Список тегів, які потребують відстеження
    const trackedTags = [
        'a', 'button', 'input', 'img', 'label',
        'select', 'textarea', 'svg', 'li', 'option',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'div', 'span' // Додаємо div та span до списку для обробки
    ];

    // Модифікована хеш-функція, яка повертає 9-цифровий числовий хеш без провідних нулів
    function simpleHash(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
        }
        // Отримуємо позитивне число та беремо останні 9 цифр, забезпечуючи, що перша цифра не 0
        const numericHash = (Math.abs(hash) % 900000000) + 100000000;
        // Перетворюємо число на рядок без провідних нулів
        return numericHash.toString();
    }

    // Об'єкт для відстеження кількості використань кожного базового хешу
    const hashCountMap = {};

    // WeakMap для зберігання відповідності між елементами та їх baseHash
    const elementBaseHashMap = new WeakMap();

    // Функція для генерації унікального ID на основі властивостей елемента
    function generateTrackingId(element) {
        try {
            // Збираємо властивості елемента
            let tag = element.tagName.toLowerCase();
            let id = element.id ? `#${element.id}` : '';
            
            // Використовуємо getAttribute('class') замість element.className
            let classAttr = element.getAttribute('class');
            let classes = classAttr ? `.${classAttr.trim().split(/\s+/).join('.')}` : '';
            
            // Для SVG елементів, можливо, немає текстового контенту, тому безпечно використовувати textContent
            let text = element.textContent ? element.textContent.trim().replace(/\s+/g, ' ') : '';
            
            let uniqueAttributes = Array.from(element.attributes)
                .filter(attr => !['class', 'id', 'plerdy-tracking-id'].includes(attr.name))
                .map(attr => `[${attr.name}="${attr.value}"]`)
                .join('');

            // Створюємо рядок для хешування
            let hashString = `${tag}${id}${classes}${uniqueAttributes}${text}`;

            // Генеруємо базовий хеш
            let baseHash = simpleHash(hashString);

            // Зберігаємо baseHash для елемента
            elementBaseHashMap.set(element, baseHash);

            // Перевіряємо, чи цей базовий хеш вже використовувався
            if (hashCountMap[baseHash]) {
                hashCountMap[baseHash]++;
            } else {
                hashCountMap[baseHash] = 1;
            }

            // Додаємо індекс до базового хешу для унікальності
            let uniqueHash = `${baseHash}${hashCountMap[baseHash].toString().padStart(2, '0')}`;

            //console.log(`Generated tracking ID: ${uniqueHash} for element:`, element); // Логування

            return uniqueHash;
        } catch (error) {
            //console.error('Error generating tracking ID:', error, element);
            return '000000000'; // Фолбек значення для 9 цифр
        }
    }

    function isClickable(element) {
        const tagName = element.tagName.toLowerCase();
        const interactiveTags = [
            'a', 'button', 'input', 'img', 'label',
            'select', 'textarea', 'svg', 'li', 'option',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'area'
        ];

        if (interactiveTags.includes(tagName)) {
            return true;
        }

        const role = element.getAttribute('role');
        const interactiveRoles = ['button', 'link', 'menuitem', 'checkbox', 'switch', 'tab', 'treeitem', 'option', 'radio'];
        if (role && interactiveRoles.includes(role)) {
            return true;
        }

        if (element.hasAttribute('onclick')) {
            return true;
        }

        if (element.hasAttribute('tabindex')) {
            return true;
        }

        if (element.isContentEditable) {
            return true;
        }

        if (element.getAttribute('draggable') === 'true') {
            return true;
        }

        if (element.hasAttribute('data-action') || element.hasAttribute('data-event')) {
            return true;
        }

        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.cursor === 'pointer') {
            return true;
        }

        // Перевірка інших on* атрибутів
        const eventAttributes = Array.from(element.attributes).filter(attr => /^on\w+/i.test(attr.name));
        if (eventAttributes.length > 0) {
            return true;
        }

        return false;
    }

    // Кеш для збереження вже згенерованих ID
    const trackingIdCache = new WeakMap();

    // Функція для отримання або генерації ID
    function getOrGenerateId(element) {
        if (trackingIdCache.has(element)) {
            return trackingIdCache.get(element);
        }
        const trackingId = generateTrackingId(element);
        trackingIdCache.set(element, trackingId);
        return trackingId;
    }

    // Функція для встановлення унікального ID
    function setUniqueId(element) {
        const trackingId = getOrGenerateId(element);
        element.setAttribute('plerdy-tracking-id', trackingId);
        //console.log(`Set tracking ID ${trackingId} for element:`, element); // Логування
        return trackingId;
    }

    // Нова функція для перевірки умови не додавання атрибуту
    function shouldNotAddAttribute(element) {
        if (element.tagName.toLowerCase() !== 'div') {
            return false;
        }
        if (element.children.length <= 2) {
            return false;
        }
        // Перевіряємо, чи мають прямі діти своїх дітей
        for (let i = 0; i < element.children.length; i++) {
            if (element.children[i].children.length > 0) {
                return true;
            }
        }
        return false;
    }

    // Додаткова функція для ідентифікації попапів
    function isPopup(element) {
        // Приклад перевірки за класом або атрибутом, змініть відповідно до вашої реалізації
        return element.classList.contains('popup') || element.getAttribute('data-popup') === 'true';
    }

    // Функція для додавання tracking-id
    function addTrackingId(element) {
        try {
            const tagName = element.tagName.toLowerCase();

            if (tagName === 'li') {
                // 1. Якщо елемент <li>, присвоюємо йому та його прямому дитині <a> однаковий tracking-id
                if (!element.hasAttribute('plerdy-tracking-id')) {
                    const trackingId = setUniqueId(element);
                    const childA = element.querySelector('a');
                    if (childA) {
                        childA.setAttribute('plerdy-tracking-id', trackingId);
                        //console.log(`Set tracking ID ${trackingId} for child <a>:`, childA);
                    }
                } else {
                    // Якщо <li> вже має tracking-id, присвоюємо його дочірному <a>, якщо воно ще не має
                    const trackingId = element.getAttribute('plerdy-tracking-id');
                    const childA = element.querySelector('a');
                    if (childA && childA.getAttribute('plerdy-tracking-id') !== trackingId) {
                        childA.setAttribute('plerdy-tracking-id', trackingId);
                        //console.log(`Updated tracking ID ${trackingId} for child <a>:`, childA);
                    }
                }
            } else if (tagName === 'a') {
                const parent = element.parentElement;
                if (parent && parent.tagName.toLowerCase() === 'li') {
                    if (parent.hasAttribute('plerdy-tracking-id')) {
                        // Присвоюємо <a> той самий tracking-id, що й у батька <li>
                        const liTrackingId = parent.getAttribute('plerdy-tracking-id');
                        if (element.getAttribute('plerdy-tracking-id') !== liTrackingId) {
                            element.setAttribute('plerdy-tracking-id', liTrackingId);
                            //console.log(`Inherited tracking ID ${liTrackingId} for <a>:`, element);
                        }
                    } else {
                        // Якщо батько <li> не має tracking-id, присвоюємо йому і <a> новий tracking-id
                        const trackingId = setUniqueId(parent);
                        element.setAttribute('plerdy-tracking-id', trackingId);
                        //console.log(`Set tracking ID ${trackingId} for <a> and its parent <li>:`, element, parent);
                    }
                } else {
                    // Якщо <a> не знаходиться всередині <li>, присвоюємо йому власний tracking-id, якщо він клікабельний
                    if (isClickable(element) && !element.hasAttribute('plerdy-tracking-id')) {
                        setUniqueId(element);
                    }
                }
            } else {
                // Перевірка нової умови для <div>
                if (tagName === 'div') {
                    if (isPopup(element)) {
                        // Якщо це попап, обробляємо його окремо
                        setUniqueId(element);
                        return;
                    }

                    if (shouldNotAddAttribute(element)) {
                        //console.log(`Skipping <div> елемент через shouldNotAddAttribute:`, element);
                        return; // Не додаємо атрибут
                    }

                    // Додавання атрибуту до div з текстом або цифрами
                    if (element.children.length === 0 && /\S/.test(element.textContent)) {
                        setUniqueId(element);
                    }

                    // Додавання атрибуту до батька div/span без тексту і без дочірніх елементів
                    if (['div', 'span'].includes(tagName)) {
                        if (element.children.length === 0 && !/\S/.test(element.textContent)) {
                            const parent = element.parentElement;
                            if (parent && ['div', 'span'].includes(parent.tagName.toLowerCase()) && !shouldNotAddAttribute(parent)) {
                                if (!parent.hasAttribute('plerdy-tracking-id')) {
                                    setUniqueId(parent);
                                }
                            }
                        }
                    }
                }

                // 4. Якщо елемент клікабельний, додати tracking-id
                if (isClickable(element)) {
                    if (!element.hasAttribute('plerdy-tracking-id')) {
                        if (tagName !== 'div' || !shouldNotAddAttribute(element)) {
                            setUniqueId(element);
                        }
                    }
                }
            }
        } catch (error) {
            //console.error('Error adding tracking ID:', error, element);
        }
    }

    // Функція для видалення tracking-id при видаленні елемента з DOM
    function removeTrackingId(element) {
        try {
            // Отримуємо baseHash з elementBaseHashMap
            const baseHash = elementBaseHashMap.get(element);
            if (baseHash) {
                // Зменшуємо лічильник у hashCountMap
                if (hashCountMap[baseHash]) {
                    hashCountMap[baseHash]--;
                    if (hashCountMap[baseHash] <= 0) {
                        delete hashCountMap[baseHash];
                    }
                }
                // Видаляємо запис з elementBaseHashMap
                elementBaseHashMap.delete(element);
            }
        } catch (error) {
            //console.error('Error removing tracking ID:', error, element);
        }
    }

    // Функція для обробки всіх елементів на сторінці
    function processAllElements() {
        try {
            // Спочатку обробляємо всі <li>, потім <a>, потім інші елементи
            const liElements = document.querySelectorAll('li');
            liElements.forEach(addTrackingId);

            const aElements = document.querySelectorAll('a');
            aElements.forEach(addTrackingId);

            const otherTags = trackedTags.filter(tag => tag !== 'li' && tag !== 'a').join(',');
            const otherElements = document.querySelectorAll(otherTags + ', [role="button"], [role="link"], [onclick]');
            otherElements.forEach(addTrackingId);
        } catch (error) {
            //console.error('Error processing all elements:', error);
        }
    }

    // Ініціалізація після завантаження DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processAllElements);
    } else {
        processAllElements();
    }

    // Налаштування MutationObserver
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            try {
                if (mutation.type === 'childList') {
                    // Обробляємо додані елементи
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Елемент
                            // Використовуємо setTimeout для очікування повного додавання дочірніх елементів
                            setTimeout(() => {
                                // Спочатку обробляємо <li>, потім <a>, потім інші
                                if (node.tagName.toLowerCase() === 'li') {
                                    addTrackingId(node);
                                }
                                if (node.tagName.toLowerCase() === 'a') {
                                    addTrackingId(node);
                                }

                                const liDescendants = node.querySelectorAll('li');
                                liDescendants.forEach(addTrackingId);

                                const aDescendants = node.querySelectorAll('a');
                                aDescendants.forEach(addTrackingId);

                                const otherDescendants = node.querySelectorAll(trackedTags.filter(tag => tag !== 'li' && tag !== 'a').join(',') + ', [role="button"], [role="link"], [onclick]');
                                otherDescendants.forEach(addTrackingId);
                            }, 100); // Затримка 100 мс, можна налаштувати при необхідності
                        }
                    });

                    // Обробляємо видалені елементи
                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Елемент
                            // Використовуємо setTimeout для безпеки, хоча в даному випадку це не обов'язково
                            setTimeout(() => {
                                // Видаляємо tracking ID для самого елемента
                                removeTrackingId(node);

                                // Видаляємо tracking ID для всіх дочірніх елементів
                                const descendants = node.querySelectorAll('*');
                                descendants.forEach(descendant => {
                                    removeTrackingId(descendant);
                                });
                            }, 0);
                        }
                    });
                } else if (mutation.type === 'attributes') {
                    if (isClickable(mutation.target)) {
                        addTrackingId(mutation.target);
                    }
                }
            } catch (error) {
                //console.error('Error in MutationObserver:', error);
            }
        });
    });

    // Спостерігач за змінами в body
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['role', 'onclick']
    });

})();
;plerdy_tags_arr = {
    "S": 91,
    "H3": 17,
    "LOOM-SHADOW": 134,
    "SPAN": 2,
    "OPTION": 52,
    "YOBJECT": 86,
    "H5": 19,
    "MARQUEE": 158,
    "STRIKE": 126,
    "FORM": 34,
    "NAV": 25,
    "PRICE": 184,
    "H7": 21,
    "CODE": 74,
    "STRONG": 8,
    "SPAM": 122,
    "YATAG": 120,
    "HF-HOTEL-STICKY-MENU": 173,
    "CANVAS": 44,
    "DIVB": 180,
    "HF-BLOG-HEADER-SHARE": 165,
    "CAPTION": 128,
    "COLUMN": 110,
    "PV-TRIPS-PAGE": 140,
    "FB:LIKE": 156,
    "YMAPS": 47,
    "SPN": 116,
    "PV-EVENT-PROGRAM": 136,
    "PASSWORDBOXICON": 95,
    "SECTION": 35,
    "PV-EVENT-REVIEWS": 143,
    "PV-CALENDAR-LEGEND": 161,
    "INPUT": 4,
    "MARK": 146,
    "DETAILS": 179,
    "SUMMARY": 160,
    "svg": 10,
    "OPTGROUP": 83,
    "NOFOLLOW": 190,
    "NOBR": 90,
    "DD": 59,
    "VIDEO": 57,
    "g": 71,
    "HF-ENTRY-SEARCH": 166,
    "ABR": 94,
    "MSREADOUTSPAN": 149,
    "PV-CONTACTS": 141,
    "aaa": 107,
    "SUP": 78,
    "ADDRESS": 60,
    "NOINDEX": 79,
    "TD": 27,
    "SUB": 131,
    "FIGURE": 68,
    "BLOCKQUOTE": 66,
    "OBJECT": 62,
    "TIME": 69,
    "SAMP": 118,
    "COD": 112,
    "IMG": 3,
    "FIGCAPTION": 82,
    "OL": 38,
    "PV-HEADER": 145,
    "P": 14,
    "path": 33,
    "PV-ROOT": 162,
    "PV-CALENDAR": 144,
    "W-DIV": 130,
    "IFRAME": 58,
    "TH": 51,
    "H2": 16,
    "MENU": 163,
    "PV-EVENT-PAGE": 135,
    "line": 40,
    "UL": 31,
    "H4": 18,
    "N": 39,
    "ST-DIV": 174,
    "HF-SOFTWARE-HEADER-FORM": 178,
    "H8": 22,
    "TR": 43,
    "H6": 20,
    "BODY": 9,
    "AREA": 121,
    "VAR": 147,
    "FIELDSET": 72,
    "PV-DATE-PICKER": 139,
    "SERTY": 127,
    "LIGHTER": 198,
    "AUDIO": 189,
    "rect": 65,
    "PV-ALBUM-IMAGE": 193,
    "DT": 53,
    "ellipse": 80,
    "HR": 56,
    "TABLE": 55,
    "TEXTAREA": 37,
    "BIG": 119,
    "DVI": 185,
    "XMP": 197,
    "SMALL": 23,
    "BUTTON": 5,
    "TT": 188,
    "PV-EVENT-PRICING": 137,
    "PROGRESS": 187,
    "ST1:METRICCONVERTER": 111,
    "DIV": 1,
    "LT-BUTTONS": 199,
    "A": 6,
    "text": 108,
    "HTML": 26,
    "IFR": 191,
    "TCXSPAN": 183,
    "LABEL": 46,
    "HF-HEADER": 167,
    "PV-LOADER": 182,
    "HF-COMPANY-ABOUT": 177,
    "HF-CAREERS-ENTRY": 176,
    "BR": 117,
    "HF-ENTRY-HOTEL": 172,
    "PV-REVIEWS-PAGE": 194,
    "MAIN": 50,
    "HF-SOFTWARE-PROMO": 170,
    "TRANS": 169,
    "circle": 32,
    "INS": 64,
    "PV-REVIEW": 159,
    "CONTEXT-BUTTON": 157,
    "SAVE-MY-EYES-DIALOG-POPUP": 85,
    "YA-TR-SPAN": 155,
    "PV-ALBUM-PAGE": 153,
    "TBODY": 42,
    "PRE": 84,
    "use": 11,
    "ASIDE": 63,
    "ADRESS": 152,
    "THEAD": 76,
    "PV-SUBSCRIPTION-SECTION": 150,
    "polygon": 49,
    "CITE": 73,
    "I": 7,
    "SPRING:HTMLESCAPE": 142,
    "TRANSOVER-POPUP": 186,
    "DL": 54,
    "HEADER": 13,
    "#document": 88,
    "CENTER": 67,
    "EMBED": 45,
    "ABBR": 113,
    "ARTICLE": 36,
    "HF-SOFTWARE-ABOUT": 168,
    "U": 48,
    "FOOTER": 12,
    "JDIV": 75,
    "SELECT": 30,
    "V-DIV": 132,
    "W69B-CFD-CASTIFY-DRAW-CONTAINER": 192,
    "B": 24,
    "LI": 29,
    "HF-ENTRY-MAIN": 164,
    "FFN": 148,
    "LAYER": 61,
    "DEL": 77,
    "TFOOT": 81,
    "FONT": 28,
    "LEGEND": 89,
    "ACRONYM": 92,
    "AVAST-PAM-IMG": 93,
    "PV-EVENT-GALLERY": 151,
    "PV-ADDITIONAL-INFO": 138,
    "PV-ALBUMS-PAGE": 171,
    "HF-SOFTWARE-HEADER": 175,
    "H1": 15,
    "Q": 70,
    "PK-POPUP": 124,
    "DIV1": 87,
    "div": 125,
    "GISPHONE": 123,
    "EM": 41
}
;(function() {
  var CssSelectorGenerator, root,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CssSelectorGenerator = (function() {
    CssSelectorGenerator.prototype.default_options = {
      selectors: ['id', 'class', 'tag', 'nthchild'],
      prefix_tag: false,
      attribute_blacklist: [],
      attribute_whitelist: [],
      quote_attribute_when_needed: false,
      id_blacklist: [],
      class_blacklist: []
    };

    function CssSelectorGenerator(options) {
      if (options == null) {
        options = {};
      }
      this.options = {};
      this.setOptions(this.default_options);
      this.setOptions(options);
    }

    CssSelectorGenerator.prototype.setOptions = function(options) {
      var key, results, val;
      if (options == null) {
        options = {};
      }
      results = [];
      for (key in options) {
        val = options[key];
        if (this.default_options.hasOwnProperty(key)) {
          results.push(this.options[key] = val);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    CssSelectorGenerator.prototype.isElement = function(element) {
      return !!((element != null ? element.nodeType : void 0) === 1);
    };

    CssSelectorGenerator.prototype.getParents = function(element) {
      var current_element, result;
      result = [];
      if (this.isElement(element)) {
        current_element = element;
        while (this.isElement(current_element)) {
          result.push(current_element);
          current_element = current_element.parentNode;
        }
      }
      return result;
    };

    CssSelectorGenerator.prototype.getTagSelector = function(element) {
      return this.sanitizeItem(element.tagName.toLowerCase());
    };

    CssSelectorGenerator.prototype.sanitizeItem = function(item) {
      var characters;
      characters = (item.split('')).map(function(character) {
        if (character === ':') {
          return "\\" + (':'.charCodeAt(0).toString(16).toUpperCase()) + " ";
        } else if (/[ !"#$%&'()*+,.\/;<=>?@\[\\\]^`{|}~]/.test(character)) {
          return "\\" + character;
        } else {
          return escape(character).replace(/\%/g, '\\');
        }
      });
      return characters.join('');
    };

    CssSelectorGenerator.prototype.sanitizeAttribute = function(item) {
      var characters;
      if (this.options.quote_attribute_when_needed) {
        return this.quoteAttribute(item);
      }
      characters = (item.split('')).map(function(character) {
        if (character === ':') {
          return "\\" + (':'.charCodeAt(0).toString(16).toUpperCase()) + " ";
        } else if (/[ !"#$%&'()*+,.\/;<=>?@\[\\\]^`{|}~]/.test(character)) {
          return "\\" + character;
        } else {
          return escape(character).replace(/\%/g, '\\');
        }
      });
      return characters.join('');
    };

    CssSelectorGenerator.prototype.quoteAttribute = function(item) {
      var characters, quotesNeeded;
      quotesNeeded = false;
      characters = (item.split('')).map(function(character) {
        if (character === ':') {
          quotesNeeded = true;
          return character;
        } else if (character === "'") {
          quotesNeeded = true;
          return "\\" + character;
        } else {
          quotesNeeded = quotesNeeded || (escape(character === !character));
          return character;
        }
      });
      if (quotesNeeded) {
        return "'" + (characters.join('')) + "'";
      }
      return characters.join('');
    };

    CssSelectorGenerator.prototype.getIdSelector = function(element) {
      var id, id_blacklist, prefix, sanitized_id;
      prefix = this.options.prefix_tag ? this.getTagSelector(element) : '';
      id = element.getAttribute('id');
      id_blacklist = this.options.id_blacklist.concat(['', /\s/, /^\d/]);
      if (id && (id != null) && (id !== '') && this.notInList(id, id_blacklist)) {
        sanitized_id = prefix + ("#" + (this.sanitizeItem(id)));
        if (element.ownerDocument.querySelectorAll(sanitized_id).length === 1) {
          return sanitized_id;
        }
      }
      return null;
    };

    CssSelectorGenerator.prototype.notInList = function(item, list) {
      return !list.find(function(x) {
        if (typeof x === 'string') {
          return x === item;
        }
        return x.exec(item);
      });
    };

    CssSelectorGenerator.prototype.getClassSelectors = function(element) {
      var class_string, item, k, len, ref, result;
      result = [];
      class_string = element.getAttribute('class');
      if (class_string != null) {
        class_string = class_string.replace(/\s+/g, ' ');
        class_string = class_string.replace(/^\s|\s$/g, '');
        if (class_string !== '') {
          ref = class_string.split(/\s+/);
          if(ref.length > 5){
              ref = ref.slice(0, 5);
          }
          for (k = 0, len = ref.length; k < len; k++) {
            item = ref[k];
            if (this.notInList(item, this.options.class_blacklist)) {
              result.push("." + (this.sanitizeItem(item)));
            }
          }
        }
      }
      return result;
    };

    CssSelectorGenerator.prototype.getAttributeSelectors = function(element) {
      var a, attr, blacklist, k, l, len, len1, ref, ref1, ref2, result, whitelist;
      result = [];
      whitelist = this.options.attribute_whitelist;
      for (k = 0, len = whitelist.length; k < len; k++) {
        attr = whitelist[k];
        if (element.hasAttribute(attr)) {
          result.push("[" + attr + "=" + (this.sanitizeAttribute(element.getAttribute(attr))) + "]");
        }
      }
      blacklist = this.options.attribute_blacklist.concat(['id', 'class']);
      ref = element.attributes;
      for (l = 0, len1 = ref.length; l < len1; l++) {
        a = ref[l];
        if (!((ref1 = a.nodeName, indexOf.call(blacklist, ref1) >= 0) || (ref2 = a.nodeName, indexOf.call(whitelist, ref2) >= 0))) {
          result.push("[" + a.nodeName + "=" + (this.sanitizeAttribute(a.nodeValue)) + "]");
        }
      }
      return result;
    };

    CssSelectorGenerator.prototype.getNthChildSelector = function(element) {
      var counter, k, len, parent_element, prefix, sibling, siblings;
      parent_element = element.parentNode;
      prefix = this.options.prefix_tag ? this.getTagSelector(element) : '';
      if (parent_element != null) {
        counter = 0;
        siblings = parent_element.childNodes;
        for (k = 0, len = siblings.length; k < len; k++) {
          sibling = siblings[k];
          if (this.isElement(sibling)) {
            counter++;
            if (sibling === element) {
              return prefix + (":nth-child(" + counter + ")");
            }
          }
        }
      }
      return null;
    };

    CssSelectorGenerator.prototype.testSelector = function(element, selector) {
      var is_unique, result;
      is_unique = false;
      if ((selector != null) && selector !== '') {
        result = element.ownerDocument.querySelectorAll(selector);
        if (result.length === 1 && result[0] === element) {
          is_unique = true;
        }
      }
      return is_unique;
    };

    CssSelectorGenerator.prototype.testUniqueness = function(element, selector) {
      var found_elements, parent;
      parent = element.parentNode;
      found_elements = parent.querySelectorAll(selector);
      return found_elements.length === 1 && found_elements[0] === element;
    };

    CssSelectorGenerator.prototype.testCombinations = function(element, items, tag) {
      var item, k, l, len, len1, len2, len3, m, n, ref, ref1, ref2, ref3;
      if (tag == null) {
        tag = this.getTagSelector(element);
      }
      if (!this.options.prefix_tag) {
        ref = this.getCombinations(items);
        for (k = 0, len = ref.length; k < len; k++) {
          item = ref[k];
          if (this.testSelector(element, item)) {
            return item;
          }
        }
        ref1 = this.getCombinations(items);
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          item = ref1[l];
          if (this.testUniqueness(element, item)) {
            return item;
          }
        }
      }
      ref2 = this.getCombinations(items).map(function(item) {
        return tag + item;
      });
      for (m = 0, len2 = ref2.length; m < len2; m++) {
        item = ref2[m];
        if (this.testSelector(element, item)) {
          return item;
        }
      }
      ref3 = this.getCombinations(items).map(function(item) {
        return tag + item;
      });
      for (n = 0, len3 = ref3.length; n < len3; n++) {
        item = ref3[n];
        if (this.testUniqueness(element, item)) {
          return item;
        }
      }
      return null;
    };

    CssSelectorGenerator.prototype.getUniqueSelector = function(element) {
      var k, len, ref, selector, selector_type, selectors, tag_selector;
      tag_selector = this.getTagSelector(element);
      ref = this.options.selectors;
      for (k = 0, len = ref.length; k < len; k++) {
        selector_type = ref[k];
        switch (selector_type) {
          case 'id':
            selector = this.getIdSelector(element);
            break;
          case 'tag':
            if (tag_selector && this.testUniqueness(element, tag_selector)) {
              selector = tag_selector;
            }
            break;
          case 'class':
            selectors = this.getClassSelectors(element);
            if ((selectors != null) && selectors.length !== 0) {
              selector = this.testCombinations(element, selectors, tag_selector);
            }
            break;
          case 'attribute':
            selectors = this.getAttributeSelectors(element);
            if ((selectors != null) && selectors.length !== 0) {
              selector = this.testCombinations(element, selectors, tag_selector);
            }
            break;
          case 'nthchild':
            selector = this.getNthChildSelector(element);
        }
        if (selector) {
          return selector;
        }
      }
      return '*';
    };

    CssSelectorGenerator.prototype.getSelector = function(element) {
      if( (location.host.indexOf('workfusion')*1 > -1) || (location.host.indexOf('www.pantheonsite')*1 > -1)){
          var LongS = true;
      }else{
          var LongS = false;
      }
      var item, k, len, parents, result, selector, selectors;
      selectors = [];
      parents = this.getParents(element);
      for (k = 0, len = parents.length; k < len; k++) {
        item = parents[k];
        selector = this.getUniqueSelector(item);
        if (selector != null) {
          selectors.unshift(selector);
          result = selectors.join(' > ');
          if(LongS){
              
          }else{
            if (this.testSelector(element, result)) {
                return result;
            }
          }
        }
      }
      if(LongS){
        if (this.testSelector(element, result)) {
            return result;
        }
      }
      return null;
    };

    CssSelectorGenerator.prototype.getCombinations = function(items) {
      var i, j, k, l, ref, ref1, result;
      if (items == null) {
        items = [];
      }
      result = [[]];
      for (i = k = 0, ref = items.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        for (j = l = 0, ref1 = result.length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
          result.push(result[j].concat(items[i]));
        }
      }
      result.shift();
      result = result.sort(function(a, b) {
        return a.length - b.length;
      });
      result = result.map(function(item) {
        return item.join('');
      });
      return result;
    };

    return CssSelectorGenerator;

  })();

  
    root = typeof exports !== "undefined" && exports !== null ? exports : this;
    root.CssSelectorGenerator = CssSelectorGenerator;
  

}).call(this);
;var plerdyShowEventsPopup = false;
var startSessionInPageTime = new Date();
var eventHandledSessionInPageTime = false;
var plerdyTypeTrack = 0;
var Plerdy_lastScrollTop = 0;
var Plerdy_lastScrollTop_2 = 0;
var pledyTimeOfClick = 0;
var PlerdyFormIsShowed = 0;
var PlerdyFormIsShowed_2 = 0;
var PlerdyFormIsShowedButtonLabel = 0;
var PlerdyFormIsShowedButtonLabel_2 = 0;
var initPlerdyUrlOriginal = window.location.href;
var initPlerdyUrlOriginalO = window.location;
var hoverActiveOnOff = 0;
var plerdy_click_number_on_page = 0;
var my_selector_generator;

var on_off_mode_show;
var old_device;
var pageUrl = getPlerdy_PageUrl(true);
var parts = pageUrl.split('#');
var plerdy_refferer = document.referrer;
if (plerdy_refferer && plerdy_refferer.indexOf('plerdy.') > -1 && plerdy_refferer.indexOf('/panel/') > -1) {
    var part2 = '/';
} else {
    var part2 = '';
}
var trfficSource = null;
var pageUrl = getPlerdy_PageUrl(false);

function init_click_count_plerdy(optionArr) {
    this.form_params = {};
    this.properties = {
        site_url: '',
        ip_visitor: '',
        position: '',
        page_url: '',
        user_hash: _site_hash_code,
        suid: _suid,
        plerdy_url: optionArr.plerdy_url0 + 'click/',
        device: 'desktop',
        cookie_form: '',
        doingrequest: 0,
        position: [],
        tag_name: [],
        el_on_click: [],
        class_name: [],
        node_number: [],
        click_number: [],
        reserve_selector: [],
        class_list: [],
        id_list: [],
        hash_tag: [],
    };
    this.mouseOverParams = {};
    this.mouseHoverParams = {};
    this.temp_values = {
        show_form: 'yes'
    };
    this.mouseHoverParams_for_Scroll = {};
    this.time_in_page = {};

    var _self = this;
    var target;

    this.Init = function (options) {

        var device = 'desktop';

        if (mobileAndTabletcheck()) {
            device = 'tablet';
        }
        if (mobilecheck()) {
            device = 'mobile';
        }

        _self.properties.device = device;
        _self.properties.page_title = document.title.trim();
        _self.properties = _self.merge_options(_self.properties, options);

        _self.properties.page_url = getPlerdy_PageUrl();
        _self.properties.site_url = _self.get_domain(_self.properties.page_url);


        _self.event_click(_self.sendAllparams);
        _self.event_key_up(_self.sendAllparams);
        _self.event_key_press();
        _self.event_mouse_move();
        _self.event_document_hidden();
        //_self.event_mouse_selection();

        on_off_mode_show = 0;
        if (!part2 || part2.indexOf('/') === -1) {
            if (_self.getCookieLocal('show1') == 'show1') {
                on_off_mode_show = 1;
                setTimeout(function () {
                    _self.showcontrol();
                }, 1000);
            }
        }
    };

    this.event_document_hidden = function () {
        if ('onbeforeunload' in window) {
            window.addEventListener("beforeunload", function (event) {
                if (!eventHandledSessionInPageTime) {
                    eventHandledSessionInPageTime = true;
                    userleftPage();
                }
            });
        }
        if ('onpagehide' in window) {
            window.addEventListener("pagehide", function (event) {
                if (!eventHandledSessionInPageTime) {
                    eventHandledSessionInPageTime = true;
                    userleftPage();
                }
            });
        }

        if (typeof document.hidden !== "undefined") {
            window.addEventListener("visibilitychange", function (event) {
                if (!eventHandledSessionInPageTime) {
                    eventHandledSessionInPageTime = true;
                    handleVisibilityChange();
                }
            });
        }
        if (typeof document.webkitHidden !== "undefined") {
            window.addEventListener("webkitvisibilitychange", function (event) {
                if (!eventHandledSessionInPageTime) {
                    eventHandledSessionInPageTime = true;
                    handleVisibilityChange();
                }
            });
        }
        if (typeof document.msHidden !== "undefined") {
            window.addEventListener("msvisibilitychange", function (event) {
                if (!eventHandledSessionInPageTime) {
                    eventHandledSessionInPageTime = true;
                    handleVisibilityChange();
                }
            });
        }

        function handleVisibilityChange() {
            if (document.hidden || document.visibilityState === 'hidden') {
                userleftPage();
            } else {
                startSessionInPageTime = new Date();
                eventHandledSessionInPageTime = false;
            }
        }

        function userleftPage() {
            // User has left the page
            var endTime = new Date();
            var time_spent = Math.round((endTime.getTime() - startSessionInPageTime.getTime()) / 1000);

            _self.time_in_page.user_id = _self.properties.suid;
            _self.time_in_page.user_hash = _self.properties.user_hash;
            if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
                _self.time_in_page.id_page = plerdy_config.id_page
            } else {
                _self.time_in_page.id_page = _self.getCookieLocal('id_page');
            }

            _self.time_in_page.user_ses = sesNamePuserSes;
            _self.time_in_page.host = _self.get_domain(_self.properties.page_url);
            _self.time_in_page.time_spent = time_spent;
            var params = encodeURIComponent(JSON.stringify(_self.time_in_page, null, 2));
            if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
                var url = mainScriptPlerdy_host_tracker + '/send_important_message_test';
            } else {
                var url = mainScriptPlerdy_host_tracker + '/send_important_message';
            }
            var async = false;
            if (time_spent > 0) {
                _self.sendpost(url, 'application/json', function () {
                    startSessionInPageTime = new Date();
                    eventHandledSessionInPageTime = false;
                }, async, 'params=' + params);
            }
        }

    };

    this.appendScript = function (script_name) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.dataset.plerdy_ga_events_FILE = 'plerdy_ga_events_FILE';
        s.src = plerdy_config.plerdy_url0 + 'public/js/click/includes/' + script_name;
        try {
            document.body.appendChild(s);
        } catch (e) {
            //console.log(e);
        }
    }

    // this.event_mouse_selection = function(){
    //     window.addEventListener("mouseup", function (e) {
    //         if(_self.properties.device == 'desktop'){
    //             _self.selectTestFunctional();
    //         }
    //     });
    //
    //     document.addEventListener("touchcancel", function (e) {
    //         if(_self.properties.device == 'mobile' || _self.properties.device == 'tablet'){
    //             _self.selectTestFunctional();
    //         }
    //     });
    // };

    var plerdySelectedText = '';

    this.total_cnt = 0;
    this.event_mouse_move = function () {
        if (window.plerdyDetectWrongCountry && window.plerdyDetectWrongCountry * 1 === 1) {
            return;
        }
        var y, yY;
        if (_self.properties.device == 'desktop') {
            var Y = _self.getDocHeight();
            var old_yY = '';
            _self.mouseHoverParams_for_Scroll.position = {};
            window.addEventListener("mousemove", function (e) {
                if (on_off_mode_show * 1 === 1) {
                    //
                } else {
                    if (_self.getCookieLocal('stopRequest') * 1 !== 1 && _self.getCookieLocal('stopCollectClicks') * 1 !== 1) {
                        y = e.pageY;
                        yY = 10 * Math.round(Math.round(y / Y * 100) / 11) + 10;
                        yY = yY + '_';
                        if (old_yY != yY) {
                            if (_self.mouseHoverParams_for_Scroll.position[yY]) {
                                _self.mouseHoverParams_for_Scroll.position[yY] = _self.mouseHoverParams_for_Scroll.position[yY] + 1;
                            } else {
                                _self.mouseHoverParams_for_Scroll.position[yY] = 1;
                            }
                            _self.total_cnt = _self.total_cnt * 1 + 1;
                        }
                        old_yY = yY;
                        if (_self.total_cnt * 1 >= 20) {
                            _self.SendMouseInRegion();
                        }
                    }
                }
            });
        }
    };

    this.dorequest_SendMouseInRegion = 0;
    this.SendMouseInRegion = function (async) {
        if (window.plerdyDetectWrongCountry && window.plerdyDetectWrongCountry * 1 === 1) {
            return;
        }
        if (async === undefined) {
            async = true;
        }
        if (_self.dorequest_SendMouseInRegion * 1 === 1) {
            return false;
        }
        if (on_off_mode_show * 1 === 1) {
            return false;
        }
        if (_self.total_cnt > 0) {
            _self.dorequest_SendMouseInRegion = 1;
            if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
                var cook = plerdy_config.id_page;
            } else {
                var cook = _self.getCookieLocal('id_page') * 1;
            }
            if (!cook) {
                if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
                    cook = plerdy_config.id_page;
                }
            }
            if (cook && cook * 1 > 0) {
                if (plerdy_config.traffic_source) {
                    _self.mouseHoverParams_for_Scroll.traffic_source = plerdy_config.traffic_source;
                } else if (_self.properties.traffic_source) {
                    _self.mouseHoverParams_for_Scroll.traffic_source = _self.properties.traffic_source;
                } else {
                    _self.mouseHoverParams_for_Scroll.traffic_source = 'direct';
                }
                _self.mouseHoverParams_for_Scroll.suid = _self.properties.suid;
                _self.mouseHoverParams_for_Scroll.user_hash = _self.properties.user_hash;
                _self.mouseHoverParams_for_Scroll.unique_sessions = plerdy_config.first_visit
                if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
                    _self.mouseHoverParams_for_Scroll.id_page = plerdy_config.id_page
                } else {
                    _self.mouseHoverParams_for_Scroll.id_page = _self.getCookieLocal('id_page');
                }
                if (window.country_code_plerdy) {
                    _self.mouseHoverParams_for_Scroll.country_code_plerdy = window.country_code_plerdy;
                } else {
                    _self.mouseHoverParams_for_Scroll.country_code_plerdy = "";
                }
                _self.mouseHoverParams_for_Scroll.trigger_id = window.plerdy_send_user_group ? window.plerdy_send_user_group : 0;
                _self.mouseHoverParams_for_Scroll.user_ses = sesNamePuserSes;
                _self.mouseHoverParams_for_Scroll.user_ses = sesNamePuserSes;
                _self.mouseHoverParams_for_Scroll.site_url = _self.get_domain(_self.properties.page_url);
                var params = encodeURIComponent(JSON.stringify(_self.mouseHoverParams_for_Scroll, null, 2));
                if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
                    var url = plerdy_config.plerdy_url_save_test + 'send_mouse_in_region';
                } else {
                    var url = plerdy_config.plerdy_url_save + 'send_mouse_in_region';
                }
                _self.sendpost(url, 'application/json', function () {
                    _self.total_cnt = 0;
                    _self.mouseHoverParams_for_Scroll.position = {};
                    _self.dorequest_SendMouseInRegion = 0;
                }, async, 'params=' + params);
            }
        }
    }

    this.hide_embedform = function () {
        var ifr = document.querySelector('[src*="click/iframe?user_id=' + _suid + '"]');
        if (ifr) {
            ifr.parentNode.removeChild(ifr);
        }
    }

    this.ipAction = function () {
        _self.properties.traffic_source = plerdy_config.traffic_source;
        if (object.getCookieLocal('country_code')) {
            _self.properties.country_code = object.getCookieLocal('country_code');
        } else {
            _self.properties.country_code = '';
        }
        var params = encodeURIComponent(JSON.stringify(_self.properties, null, 2));
        _self.setCookieLocal('form_was_closed_to_button', 0);
        var plerdy_script = document.createElement('script');
        plerdy_script.onload = function () {

            function sendDataDevice(element) {
                try {
                    var dataObj = {};
                    dataObj.type = "device";
                    dataObj.value = object.properties.device;
                    element.contentWindow.postMessage(dataObj, "*");
                } catch (error) {

                }
            }

            plerdyCheckElementAppear("[src*='plerdy.loc/click/iframe']", sendDataDevice);
            plerdyCheckElementAppear("[src*='plerdy.com/click/iframe']", sendDataDevice);


            var cooki = encodeURIComponent(JSON.stringify(_self.readCookieRegExp()));
            if (_self.getCookieLocal('ip') && window.country_code_plerdy) {
                _self.properties.ip_visitor = _self.getCookieLocal('ip');
                _self.rulesAction();
            } else {
                if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
                    _self.sendget(plerdy_config.plerdy_url_save_test + 'ip?params=' + params + '&cooki=' + cooki + "&ip_a=1", 'application/json', function (data) {
                        if (data) {
                            var d = JSON.parse(data);
                            if (d.ip) {
                                _self.properties.ip_visitor = d.ip;
                                _self.setCookieLocal('ip', _self.properties.ip_visitor);
                                if (d.country) {
                                    if (window.country_code_plerdy) {

                                    } else {
                                        window.country_code_plerdy = d.country;
                                    }
                                }
                                _self.rulesAction();
                            }
                        }
                    });
                } else {
                    _self.sendget(plerdy_config.plerdy_url_save + 'ip?params=' + params + '&cooki=' + cooki + "&ip_a=1", 'application/json', function (data) {
                        if (data) {
                            var d = JSON.parse(data);
                            if (d.ip) {
                                _self.properties.ip_visitor = d.ip;
                                _self.setCookieLocal('ip', _self.properties.ip_visitor);

                                _self.rulesAction();
                            }
                        }
                    });
                }
            }
        };
        plerdy_script.src = MAINPLERDYURL + 'public/screens/' + _suid + '/data/data_plerdy_form.js?v=' + Math.random();
        document.getElementsByTagName('head')[0].appendChild(plerdy_script);
    };

    this.rulesAction = function () {
        var finish_data = _self.rules_forForm();
        if (finish_data) {
            _self.callbackIP(finish_data);
        }
    };
    this.preloaderOnPage = function (timeOut) {
        if (timeOut === undefined) {
            timeOut = 1000;
        }
        addStyle_Plerdy('@keyframes loader{15%{transform: translateX(0)}45%{transform: translateX( 200px)}65%{transform: translateX( 200px)}95%{transform: translateX(0)}}#preloader_pl{position:fixed;background:white; opacity:0.98; top: 0;left: 0;height: 100%;width: 100%; z-index: 99999999!important;}.preloader-dots{background-image: none; transform: translate(-50%, -50%) scale(1);top: 50%;left: 50%; position: absolute; margin: auto; width: 100px !important;height: 70px !important;background-size: contain;} .preloader--dot{animation-name: loader;animation-timing-function: ease-in-out;animation-duration: 3s;animation-iteration-count: infinite; height: 20px;width: 20px;border-radius: 100%;background-color: black;position: absolute;border: 2px solid white;}.preloader--dot:first-child{background-color: #18c15e;animation-delay: 0.8s;}.preloader--dot:nth-child(2){background-color: #4bc55f;animation-delay: 0.7s;}.preloader--dot:nth-child(3){background-color: #7eca61;animation-delay: 0.6s;}.preloader--dot:nth-child(4){background-color: #b2cf63;animation-delay: 0.5s;}.preloader--dot:nth-child(5){background-color: #e5d365;animation-delay: 0.4s;}.preloader--dot:nth-child(6){background-color: #ffca66;animation-delay: 0.3s;}.preloader--dot:nth-child(7){background-color: #fdb266;animation-delay: 0.2s;}.preloader--dot:nth-child(8){background-color: #fc9965;animation-delay: 0.1s;}.preloader--dot:nth-child(9){background-color: #fa8165;animation-delay: 0s;}.preloader--dot:nth-child(10){background-color: #f86864;animation-delay: 0s;}', 'preloader_dots');
        let data = "<div class='preloader-dots'><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--dot'></div><div class='preloader--text'></div></div>";
        var div = document.createElement('DIV');
        div.id = 'preloader_pl';
        div.style.display = 'block';
        div.innerHTML = data;
        document.querySelector('BODY').appendChild(div);
        _self.hidePreloadOnPage(timeOut);
    };

    this.hidePreloadOnPage = function (timeOut) {
        setTimeout(function () {
            var el = document.querySelector('#preloader_pl');
            if (el) {
                el.parentNode.removeChild(el);
                var preloader_dots = 'preloader_dots';
                var head = document.head || document.getElementsByTagName('head')[0];
                if (document.querySelector("[data-pl='" + preloader_dots + "']")) {
                    head.removeChild(document.querySelector("[data-pl='" + preloader_dots + "']"));
                }
            }
        }, timeOut);
    };

    /**
     *
     * @param event el
     * @returns object target
     */
    this.getTarget = function (el) {
        if (plerdy_config.id_page * 1 === 0) {
            return false;
        }
        var plerdy_event = el;
        if (plerdy_event.target.nodeName === 'HTML') {
            return false;
        }

        try {
            var plerdy_target = document.elementFromPoint(plerdy_event.clientX, plerdy_event.clientY);
        } catch (eror) {

        }
        if (plerdy_target) {
            ///
        } else {
            var plerdy_target = plerdy_event.target;
        }


        if (plerdy_target.nodeName === 'use') {
            plerdy_target = plerdy_target.parentElement;
        }
        if (plerdy_target.nodeName === 'svg') {
            plerdy_target = plerdy_target.parentElement;
        }
        if (plerdy_target.tagName === 'SPAN' || plerdy_target.tagName === 'DIV') {
            // Якщо тег "а" має в середині
            // http://prntscr.com/kqz28o span div ми всі кліки присвоюємо тегу "а".
            // Тут таке http://prntscr.com/kqz32c . Тобто давай дивимось по висоті тегу "а".
            //  якщо менша http://prntscr.com/kqz8lb 42px обєднуємо, якщо ні, залишаємо як є.
            try {
                if (plerdy_target.parentElement.tagName === 'A') {
                    var E_style = getComputedStyle(plerdy_target.parentElement);
                    if (parseInt(E_style.height.replace('px', '')) * 1 < 42) {
                        plerdy_target = plerdy_target.parentElement;
                    }
                }
            } catch (eror) {
                ///
            }
        }

        if (plerdy_target.tagName === 'A') {
            //  Якщо тег "а" в середині має input, тоді кліки присвоюємо для input, якщо по ньому був клік
            var temp_target = _self.checkIfElementHasSpesifiedTag(plerdy_target, 'INPUT');
            if (temp_target) {
                plerdy_target = temp_target;
            }
        }
        return plerdy_target;
    };

    this.generateSelectorByMyFunction = function (t_n1, ch_n1) {
        var tN = t_n1;
        var CN = ch_n1;
        var tagsArr = tN.reverse();
        var nodesArr = CN.reverse();
        var selector = 'BODY > ';
        for (var key2 in tagsArr) {
            if (key2 * 1 >= 0) {
                selector = selector + tagsArr[key2];
                if (nodesArr[key2] * 1 > 0) {
                    selector = selector + ":nth-child(" + nodesArr[key2] + ")";
                }
                selector = selector + ' > ';
            }
        }
        selector = rtrim(selector, '> ').trim();
        return selector;
    }

    this.event_key_up = function (callback) {
        window.onkeyup = function (e) {
            e = e || window.event;
            if (e.keyCode * 1 === 9) { // tab key
                var el = e.target;
                var c = true;
                // fix clicks if tab key pressed on the element in the form
                while (el && el.tagName != 'BODY' && c) {
                    if (el.tagName == 'FORM') {
                        _self.proccesClick(e, callback);
                        c = false;
                    }
                    var el = el.parentElement;
                }
            }
        }
    }


    /***
     * wath ctrl+alt+p
     * @param {string} callback
     * @returns
     */
    this.event_key_press = function (callback) {
        if (callback === undefined) {
            callback = '';
        }
        window.onkeydown = function (e) {
            e = e || window.event;
            if ((e.ctrlKey && e.altKey && e.code == 'KeyR') || (e.ctrlKey && e.altKey && e.code * 1 === 82)) {
                clearIntervalPlerdycycleStop();
            }

            if (e.keyCode * 1 === 27) { /*esc*/
                var f_el = document.querySelector('#plerdy_m_popup1');
                if (f_el) {
                    f_el.parentNode.removeChild(f_el);
                }
            }

            if ((e.ctrlKey && e.shiftKey && e.keyCode * 1 === 76)
                || (e.ctrlKey && e.altKey && e.code == 'KeyH')
                || (e.ctrlKey && e.altKey && e.code * 1 === 72)) { /*ctrl+alt+h*/
                _self.show_hide_control();
            }
        };
    };

    this.setCookieLocal = function (cname, cvalue, path, expired) {
        if (path === undefined) {
            path = 0;
        }
        if (expired === undefined) {
            expired = 60 * 24 * 60 * 60;
        }
        if (expired * 1 > 0) {
            var now = new Date();
            var time = now.getTime();
            var ex = time + 1000 * expired;
        } else {
            var ex = '';
        }
        var ob = {};
        ob.ex = ex;
        if (path == 1) {
            cname = cname + ':::' + window.location.pathname;
        } else {
            cname = cname + ':::' + '/';
        }
        ob.cvalue = cvalue;
        var data = JSON.stringify(ob);
        try {
            window.localStorage.setItem(cname, data);
        } catch (e) {
            //console.log(e);
        }
    };

    this.getCookieLocal = function (cname) {
        var cname1 = cname + ':::' + window.location.pathname;
        try {
            var res1 = window.localStorage.getItem(cname1);
            var cname2 = cname + ':::' + '/';
            var res2 = window.localStorage.getItem(cname2);
            if (res1) {
                var data = JSON.parse(res1);
                if (data.ex) {
                    var now = new Date();
                    var time = now.getTime();
                    if (data.ex * 1 < time * 1) {
                        return '';
                    } else {
                        return data.cvalue;
                    }
                }
            } else if (res2) {
                var data = JSON.parse(res2);
                if (data.ex) {
                    var now = new Date();
                    var time = now.getTime();
                    if (data.ex * 1 < time * 1) {
                        return '';
                    } else {
                        return data.cvalue;
                    }
                }
            } else {
                return '';
            }
        } catch (e) {
            return '';
        }
    }

    this.show_hide_control = function () {
        if (on_off_mode_show * 1 === 0) {
            on_off_mode_show = 1;
            selectDevise();
            _self.setCookieLocal('show1', 'show1');
            selectDevise();
            _self.showcontrol();
            _self.sendAllparams('', false);
            sendDataScroll(false);
            _self.SendMouseInRegion(false);
        } else {
            selectDevise();
            _self.hidecontrol();
            selectDevise();
        }
    }

    this.hidecontrol = function () {
        on_off_mode_show = 0;
        _self.setCookieLocal('show1', 'not_show1');
        var plerdy_control_form_id = document.querySelector('#plerdy_control_wraper_id');
        if (plerdy_control_form_id) {
            plerdy_control_form_id.parentNode.removeChild(plerdy_control_form_id);
            var dd = document.querySelectorAll('.plerdy_active_z');
            if (dd && dd.length * 1 > 0) {
                dd.forEach(function (rr) {
                    rr.parentNode.removeChild(rr);
                });
                selectors = [];
                selectors_hovers = [];
            }
            var dd11 = document.querySelectorAll('.plerdy_active_z_hover');
            if (dd11 && dd11.length * 1 > 0) {
                dd11.forEach(function (rr) {
                    rr.parentNode.removeChild(rr);
                });
                selectors = [];
                selectors_hovers = [];
            }
        }
        _self.processHideScroll();
        var data_plerdy_style = document.querySelectorAll('[data-plerdy_style]');
        if (data_plerdy_style && data_plerdy_style.length * 1 > 0) {
            data_plerdy_style.forEach(function (item) {
                item.remove();
            });
        }
        var div = document.querySelector('#plerdy_show_on_mouse_hover');
        if (div) {
            div.parentNode.removeChild(div);
        }
        var div2 = document.querySelector('#div_plerdy_control_wraper_id');
        if (div2) {
            div2.parentNode.removeChild(div2);
        }
        var data_plerdy_style2 = document.querySelectorAll('[data-pl]');
        if (data_plerdy_style2 && data_plerdy_style2.length * 1 > 0) {
            data_plerdy_style2.forEach(function (rr) {
                rr.parentNode.removeChild(rr);
            });
        }

        let click_plerdy_Canvas = document.querySelector("#click_plerdy_Canvas");
        if (click_plerdy_Canvas) {
            click_plerdy_Canvas.parentNode.removeChild(click_plerdy_Canvas);
        }
    };

    this.showcontrol = function (url, dataForshowPanel) {
        if (!object.getCookieLocal('p_email')) {
            return false;
        }
        if (url === undefined) {
            var url = window.location.href;
        }
        if (dataForshowPanel === undefined) {
            dataForshowPanel = {};
        }
        _self.setCookieLocal('show1', 'show1');
        var url = getPlerdy_PageUrl();
        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            var id_page = plerdy_config.id_page;
        } else {
            var id_page = _self.getCookieLocal('id_page') * 1;
        }
        if (dataForshowPanel.period) {
            var pp = {"today": "today", '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', "custom": "custom"};
            var period = pp[dataForshowPanel.period];
        } else {
            var period = _self.getCookieLocal('period_plerdy') ? _self.getCookieLocal('period_plerdy') : null;
        }
        var plerdy_params = {
            panel_form: 1,
            login: _self.getCookieLocal('login'),
            page_url: url,
            id: _suid,
            id_page: id_page,
            date_start: _self.getCookieLocal('datepicker_plerdy_from') ? _self.getCookieLocal('datepicker_plerdy_from') : null,
            date_finish: _self.getCookieLocal('datepicker_plerdy_to') ? _self.getCookieLocal('datepicker_plerdy_to') : null,
            period: period,
            hash: _self.getCookieLocal('p_hash'),
            email: _self.getCookieLocal('p_email'),
        };
        if (dataForshowPanel.auto) {
            plerdy_params.date_start = dataForshowPanel.dateFrom;
            plerdy_params.date_finish = dataForshowPanel.dateTo;
            plerdy_params.type_auto = dataForshowPanel.type_auto;
            plerdy_params.auto = 1;
            if (dataForshowPanel.device !== '') {
                plerdy_params.device = dataForshowPanel.device;
            } else {
                plerdy_params.device = 'desktop';
                if (mobileAndTabletcheck()) {
                    plerdy_params.device = 'tablet';
                }
                if (mobilecheck()) {
                    plerdy_params.device = 'mobile';
                }
            }
        } else {
            plerdy_params.device = 'desktop';
            if (mobileAndTabletcheck()) {
                plerdy_params.device = 'tablet';
            }
            if (mobilecheck()) {
                plerdy_params.device = 'mobile';
            }
        }
        if (dataForshowPanel.ab_testing_id) {
            plerdy_params.ab_testing_id = dataForshowPanel.ab_testing_id;
        }
        if (window.performance) {
            if (performance.navigation.type !== 0) {
                //params.page_reloaded = 1;
                plerdySeoRulesCheck();
                plerdy_params.doSeoOrNot = window.doSeoOrNot;
            } else {
                plerdy_params.doSeoOrNot = window.doSeoOrNot;
            }
        } else {
            plerdy_params.doSeoOrNot = false;
        }

        var iframeEl = document.createElement('iframe');
        setTimeout(function () {
            plerdy_params.doSeoOrNot = window.doSeoOrNot;
            var paramsStr = (plerdy_params) ? encodeURIComponent(JSON.stringify(plerdy_params, null, 2)) : '';
            iframeEl.src = plerdy_config.plerdy_url0 + "click/get_i_template?params=" + paramsStr;
            iframeEl.setAttribute('style', 'padding: 0px;max-height: ' + document.documentElement.clientHeight + 'px; height: ' + document.documentElement.clientHeight + 'px; position: fixed; top: 0px; z-index: 9999999999; right: -250px; max-width: 500px !important; width: 260px !important; border: 0; background: #fff0; font-family: "Open Sans",sans-serif;');
            iframeEl.classList = "plerdy_control-panel-wrapper";
            iframeEl.id = "plerdy_control_wraper_id";
            iframeEl.setAttribute('scrolling', "yes");
            iframeEl.setAttribute('sandbox', 'allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation');
            iframeEl.setAttribute('data-show', '1');
            var div = document.createElement('div');
            div.setAttribute('style', 'background:url("' + plerdy_config.plerdy_url0 + 'public/css/panel/move_n.svg") no-repeat; padding: 0px; height: 25px; position: fixed; top: 0px; z-index: 9999999999; right: 250px; /*max-width: 500px;*/ width: 25px; border: 0;background-size: contain;');
            div.appendChild(iframeEl);
            div.id = "div_plerdy_control_wraper_id";
            document.querySelector('BODY').appendChild(div);
            var plerdy_options = {
                grid: 5,
                setCursor: true,
                onDragStart: function () {
                    console.log('onDragStart');
                    // document.querySelector('#plerdy_control_wraper_id').style.display = 'none';
                    document.querySelector('#plerdy_control_wraper_id').style.display = 'block';
                },
                onDragEnd: function () {
                    console.log('onDragEnd');
                    document.querySelector('#plerdy_control_wraper_id').style.display = 'block';
                }
            };

            var drajNameName = document.querySelector("[data-add_name='dragname']");
            if (drajNameName) {
                new Draggable(div, plerdy_options);
            } else {
                var ss = document.createElement('script');
                ss.type = 'text/javascript';
                ss.dataset.add_name = 'dragname';
                ss.src = plerdy_config.plerdy_url0 + 'public/js/click/drag_gulp.js';
                try {
                    document.body.appendChild(ss);
                    ss.onload = function () {
                        new Draggable(div, plerdy_options);
                    }
                } catch (e) {
                    // console.log(e);
                }
            }


            if (dataForshowPanel && dataForshowPanel.init == 'no_init') {
                //
            } else {
                setTimeout(function () {
                    sendDataForInitPlerdy();
                }, 500);
            }
        }, 1000);
        iframeEl.onload = function () {
            _self.hidePreloadOnPage(10);
        };
    };

    this.getFinish = function (date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }
    this.getStart = function (date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }


    this.setEentSetupWatcher = function (params) {
        if (params.on == true) {
            _self.processHide();
            _self.processHideScroll();
            _self.prossesHideMouseInRegions();
            // Start outline:
            if (window.jQuery) {
                //myDomOutlinePlerdy.start();
            }
        } else {
            if (window.jQuery) {
                //myDomOutlinePlerdy.stop();
            }
        }
    }

    this.readCookieRegExp = function () {
        var myRe = /show_plerdy_form_[0-9]{1,1000}=hide/g;
        var str = document.cookie
        var myArray;
        var res = [];
        while ((myArray = myRe.exec(str)) !== null) {
            res.push(myArray[0].replace('=hide', '').replace('show_plerdy_form_', ''));
        }
        return res;
    }

    /**
     *
     * @param {string} cname
     * @returns {string}
     */
    this.getCookie = function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return "";
    };

    /**
     *
     * @param {string} cname
     * @param {string} cvalue
     * @returns none
     */
    this.setCookie = function (cname, cvalue, path, expired) {
        if (path === undefined) {
            path = 0;
        }
        if (expired === undefined) {
            expired = 60 * 24 * 60 * 60;
        }
        if (expired * 1 > 0) {
            var now = new Date();
            var time = now.getTime();
            var expireTime = time + 1000 * expired;
            now.setTime(expireTime);
            var ex = ';expires=' + now.toGMTString();
        } else {
            var ex = '';
        }
        if (path == 1) {
            document.cookie = cname + "=" + cvalue + ("; path=" + window.location.pathname) + ex;
        } else {
            document.cookie = cname + "=" + cvalue + ("; path=/") + ex;
        }
    };

    this.sendAllparams = function (callback, async) {
        if (callback === undefined) {
            callback = '';
        }
        if (async === undefined) {
            async = true;
        }

        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            var cook = plerdy_config.id_page;
        } else {
            var cook = _self.getCookieLocal('id_page') * 1;
        }
        if (!cook) {
            if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
                cook = plerdy_config.id_page
            }
        }
        _self.properties.trigger_id = window.plerdy_send_user_group ? window.plerdy_send_user_group : 0;
        if (cook && cook * 1 > 0 && _self.getCookieLocal('stopCollectClicks') * 1 !== 1) {
            _self.properties.id_page = cook;
            _self.properties.unique_sessions = plerdy_config.first_visit
            if (location.host === "www.svitstyle.com.ua") {
                var numClicks = 9;
            } else {
                var numClicks = 1;
            }
            _self.properties.vid_ses = sesNameP;
            _self.properties.user_ses = sesNamePuserSes;
            if (window.country_code_plerdy) {
                _self.properties.country_code_plerdy = window.country_code_plerdy;
            } else {
                _self.properties.country_code_plerdy = "";
            }
            if (_self.properties.position.length * 1 === numClicks || (async === false && _self.properties.position.length * 1 >= 1)) {
                var params = encodeURIComponent(JSON.stringify(_self.properties, null, 2));
                if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
                    var urlSend = plerdy_config.plerdy_url_save_test + 'send';
                } else {
                    var urlSend = plerdy_config.plerdy_url_save + 'send';
                }
                _self.sendpost(urlSend, 'application/json', function (data) {
                    if (data) {
                        try {
                            data = JSON.parse(data);
                            plerdy_config.rp = data.rp; // rp - relative position
                            plerdy_config.in_p = data.in_p; // rp - initial position
                        } catch (err) {
                            //
                        }
                    }
                    _self.properties.position = [];
                    _self.properties.tag_name = [];
                    _self.properties.click_number = [];
                    _self.properties.el_on_click = [];
                    _self.properties.class_name = [];
                    _self.properties.node_number = [];
                    _self.properties.reserve_selector = [];
                    _self.properties.class_list = [];
                    _self.properties.id_list = [];
                    _self.properties.hash_tag = [];
                }, async, 'params=' + params);
            }
        }
    };


    this.redirectToHref = function () {

    }


    /**
     * execute callback for loaction
     * @param {type} data
     * @returns void
     */
    this.callbackIP = function (data) {
        setTimeout(function () {
            if ((plerdy_config.id_page && plerdy_config.id_page * 1 > 0)
                || (_self.getCookieLocal('id_page'))) {
                if (data) {
                    for (var i in data) {
                        if (data[i].ip) {
                            _self.properties.ip_visitor = data[i].ip;
                            _self.setCookieLocal('ip', _self.properties.ip_visitor);
                        }
                        if (data[i].time) {
                            var time = data[i].time;
                            if (data[i].form_params.label_button_on_off * 1 === 1 && data.length * 1 > 1) {

                                _self.fe = {}
                                _self.fe = Object.assign(_self.fe, data[i].form_params);

                                _self.properties.cookie_form_show_2 = "show_plerdy_form" + "_" + _self.fe.id;
                                if (_self.getCookie(_self.properties.cookie_form_show_2) == '') {
                                    _self.setCookie(_self.properties.cookie_form_show_2, 'show');
                                }
                                if ((_self.getCookie(_self.properties.cookie_form_show_2) == 'show') || _self.fe.show_always * 1 === 1) {
                                    _self.properties.form_id = _self.fe.id;
                                    if (_self.fe.type_show * 1 === 1) {
                                        popup_show_2 = 1;
                                        if (object.properties.device !== 'desktop') {
                                            window.addEventListener('blur', function () {
                                                if (popup_show_2 * 1 === 1) {
                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                    _self.temp_values.show_form = 'no';
                                                    popup_show_2 = 0;
                                                }
                                            });
                                        } else {
                                            function addPlerdyEvent(obj, evt, fn) {
                                                if (obj.addEventListener) {
                                                    obj.addEventListener(evt, fn, false);
                                                } else if (obj.attachEvent) {
                                                    obj.attachEvent("on" + evt, fn);
                                                }
                                            }

                                            addPlerdyEvent(document, "mouseout", function (e) {
                                                e = e ? e : window.event;
                                                var from = e.relatedTarget || e.toElement;
                                                if (!from || from.nodeName == "HTML") {
                                                    if (popup_show_2 * 1 === 1) {
                                                        _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                        _self.temp_values.show_form = 'no';
                                                        popup_show_2 = 0;
                                                    }
                                                }
                                            });
                                        }
                                        if (_self.fe.hot_selector && _self.fe.hot_selector_on_off) {
                                            try {
                                                el_hot_2 = document.querySelector(_self.fe.hot_selector);
                                                if (el_hot_2) {
                                                    on_pledy('body', 'mousedown', _self.fe.hot_selector, function () {
                                                        if (popup_show_2 * 1 === 1) {
                                                            _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                            _self.temp_values.show_form = 'no';
                                                            popup_show_2 = 0;
                                                        }
                                                    });
                                                }
                                            } catch (er) {
                                                //
                                            }
                                        }
                                    } else {
                                        if ((_self.fe.hot_selector && _self.fe.hot_selector_on_off) || _self.fe.scroll_top * 1 === 1) {
                                            popup_show_2 = 1;
                                            if (_self.fe.hot_selector) {
                                                try {
                                                    on_plerdy('body', 'mousedown', _self.fe.hot_selector, function (e) {
                                                        if (popup_show_2 * 1 === 1) {
                                                            _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                            _self.temp_values.show_form = 'no';
                                                            popup_show_2 = 0;
                                                        }
                                                    })
                                                } catch (er) {
                                                    //
                                                }
                                            }
                                            if (_self.fe.scroll_top * 1 === 1) {
                                                // element should be replaced with the actual target element on which you have applied scroll, use window in case of no target element.
                                                window.addEventListener("scroll", function () {
                                                    var st_2 = window.pageYOffset || document.documentElement.scrollTop;
                                                    if (st_2 > Plerdy_lastScrollTop_2) {
                                                        // downscroll code
                                                    } else {
                                                        if (popup_show_2 * 1 === 1) {
                                                            _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                            _self.temp_values.show_form = 'no';
                                                            popup_show_2 = 0;
                                                        }
                                                    }
                                                    Plerdy_lastScrollTop_2 = st_2 <= 0 ? 0 : st_2; // For Mobile or negative scrolling
                                                }, false);
                                            }
                                        } else {
                                            setTimeout(function () {
                                                if ((_self.fe.click_number * 1 > 0 && _self.fe.after_click_checked * 1 > 0) || (_self.fe.scroll * 1 > 0 && _self.fe.after_scroll_checked * 1 > 0)) {
                                                    if (_self.fe.click_number * 1 > 0 && _self.fe.after_click_checked * 1 > 0) {
                                                        plerdy_config.cnt_click_2 = 1;
                                                        window.addEventListener("click", function (e) {
                                                            if (plerdy_config.cnt_click_2 * 1 === _self.fe.click_number * 1) {
                                                                _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                plerdy_config.cnt_click_2 = plerdy_config.cnt_click_2 * 1 + 1;
                                                            } else {
                                                                plerdy_config.cnt_click_2 = plerdy_config.cnt_click_2 * 1 + 1;
                                                            }
                                                        });
                                                    }
                                                    if (_self.fe.scroll * 1 > 0 && _self.fe.after_scroll_checked * 1 > 0) {

                                                        window.addEventListener("mousemove", function (e) {
                                                            var body = document.body, html = document.documentElement;
                                                            var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                                                            var position_2 = e.pageY / docHeight * 100;
                                                            if (position_2 >= 20 && position_2 <= 40) {
                                                                if (_self.fe.scroll * 1 === 20) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                            if (position_2 >= 41 && position_2 <= 60) {
                                                                if (_self.fe.scroll * 1 === 40) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                            if (position_2 >= 61 && position_2 <= 80) {
                                                                if (_self.fe.scroll * 1 === 60) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                            if (position_2 >= 81 && position_2 <= 100) {
                                                                if (_self.fe.scroll * 1 === 80) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                        });
                                                        window.addEventListener('scroll', function () {
                                                            var body = document.body,
                                                                html = document.documentElement,
                                                                docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
                                                                winHeight = window.innerHeight || html.clientHeight,
                                                                scrollTop = body.scrollTop || html.scrollTop,
                                                                scrollDistance = scrollTop + winHeight;
                                                            var position_2 = scrollDistance / docHeight * 100;
                                                            if (position_2 >= 20 && position_2 <= 40) {
                                                                if (_self.fe.scroll * 1 === 20) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                            if (position_2 >= 41 && position_2 <= 60) {
                                                                if (_self.fe.scroll * 1 === 40) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                            if (position_2 >= 61 && position_2 <= 80) {
                                                                if (_self.fe.scroll * 1 === 60) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                            if (position_2 >= 81 && position_2 <= 100) {
                                                                if (_self.fe.scroll * 1 === 80) {
                                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    _self.showUserCustomPopupForm('', _self.fe, data.length * 1);
                                                }
                                            }, time * 1000);
                                        }
                                    }
                                }
                            } else {
                                _self.form_params = {};
                                _self.form_params = Object.assign(_self.form_params, data[i].form_params);
                                _self.properties.cookie_form_show = "show_plerdy_form" + "_" + _self.form_params.id;
                                if (_self.getCookie(_self.properties.cookie_form_show) == '') {
                                    _self.setCookie(_self.properties.cookie_form_show, 'show');
                                }
                                try {
                                    window.localStorage;
                                } catch (e) {
                                    _self.form_params.show_always = 1;
                                }

                                if ((_self.getCookie(_self.properties.cookie_form_show) == 'show') || _self.form_params.show_always * 1 === 1) {
                                    _self.properties.form_id = _self.form_params.id;
                                    if (_self.form_params.type_show * 1 === 1) {
                                        popup_show = 1;
                                        if (object.properties.device !== 'desktop') {
                                            window.addEventListener('blur', function () {
                                                if (popup_show * 1 === 1) {
                                                    _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                    _self.temp_values.show_form = 'no';
                                                    popup_show = 0;
                                                }
                                            });
                                        } else {
                                            function addPlerdyEvent(obj, evt, fn) {
                                                if (obj.addEventListener) {
                                                    obj.addEventListener(evt, fn, false);
                                                } else if (obj.attachEvent) {
                                                    obj.attachEvent("on" + evt, fn);
                                                }
                                            }

                                            addPlerdyEvent(document, "mouseout", function (e) {
                                                e = e ? e : window.event;
                                                var from = e.relatedTarget || e.toElement;
                                                if (!from || from.nodeName == "HTML") {
                                                    if (popup_show * 1 === 1) {
                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                        _self.temp_values.show_form = 'no';
                                                        popup_show = 0;
                                                    }
                                                }
                                            });
                                        }
                                        if (_self.form_params.hot_selector && _self.form_params.hot_selector_on_off) {
                                            try {
                                                on_plerdy('body', 'mousedown', _self.form_params.hot_selector, function (e) {
                                                    if (popup_show * 1 === 1) {
                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                        if (_self.form_params.show_always + "" !== "1") {
                                                            _self.temp_values.show_form = 'no';
                                                            popup_show = 0;
                                                        }
                                                    }
                                                })
                                            } catch (er) {
                                                //
                                            }
                                        }
                                    } else {
                                        if ((_self.form_params.hot_selector && _self.form_params.hot_selector_on_off) || _self.form_params.scroll_top * 1 === 1) {
                                            popup_show = 1;
                                            if (_self.form_params.hot_selector) {
                                                try {
                                                    on_plerdy('body', 'mousedown', _self.form_params.hot_selector, function (e) {
                                                        if (popup_show * 1 === 1) {
                                                            _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                            if (_self.form_params.show_always + "" !== "1") {
                                                                _self.temp_values.show_form = 'no';
                                                                popup_show = 0;
                                                            } else {
                                                                if (_self.form_params.hot_selector) {

                                                                } else {
                                                                    _self.temp_values.show_form = 'no';
                                                                    popup_show = 0;
                                                                }
                                                            }
                                                        }
                                                    });
                                                } catch (er) {
                                                    //
                                                }
                                            }
                                            if (_self.form_params.click_number * 1 > 0 && _self.form_params.after_click_checked * 1 > 0 && _self.form_params.scroll_top * 1 === 1) {
                                                var run_scroll = false;
                                                var run_clicks = false;
                                                if (_self.form_params.click_number * 1 > 0 && _self.form_params.after_click_checked * 1 > 0) {
                                                    plerdy_config.cnt_click = 1;
                                                    window.addEventListener("click", function (e) {
                                                        if (plerdy_config.cnt_click * 1 === _self.form_params.click_number * 1) {
                                                            run_scroll = true;
                                                            if (run_clicks) {
                                                                _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                            }
                                                            plerdy_config.cnt_click = plerdy_config.cnt_click * 1 + 1;
                                                        } else {
                                                            plerdy_config.cnt_click = plerdy_config.cnt_click * 1 + 1;
                                                        }
                                                    });
                                                }
                                                window.addEventListener("scroll", function () {
                                                    var st = window.pageYOffset || document.documentElement.scrollTop;
                                                    if (st > Plerdy_lastScrollTop) {
                                                        // downscroll code
                                                    } else {
                                                        if (popup_show * 1 === 1) {
                                                            run_clicks = true;
                                                            if (run_scroll) {
                                                                _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                _self.temp_values.show_form = 'no';
                                                                popup_show = 0;
                                                            }
                                                        }
                                                    }
                                                    Plerdy_lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
                                                }, false);
                                            } else if (_self.form_params.scroll_top * 1 === 1) {
                                                // element should be replaced with the actual target element on which you have applied scroll, use window in case of no target element.
                                                window.addEventListener("scroll", function () {
                                                    var st = window.pageYOffset || document.documentElement.scrollTop;
                                                    if (st > Plerdy_lastScrollTop) {
                                                        // downscroll code
                                                    } else {
                                                        if (popup_show * 1 === 1) {
                                                            _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                            _self.temp_values.show_form = 'no';
                                                            popup_show = 0;
                                                        }
                                                    }
                                                    Plerdy_lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
                                                }, false);
                                            }
                                        } else {
                                            setTimeout(function () {
                                                if ((_self.form_params.click_number * 1 > 0 && _self.form_params.after_click_checked * 1 > 0) || (_self.form_params.scroll * 1 > 0 && _self.form_params.after_scroll_checked * 1 > 0)) {
                                                    if (_self.form_params.click_number * 1 > 0 && _self.form_params.after_click_checked * 1 > 0) {
                                                        plerdy_config.cnt_click = 1;
                                                        window.addEventListener("mousedown", function (e) {
                                                            if (plerdy_config.cnt_click * 1 === _self.form_params.click_number * 1) {
                                                                _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                plerdy_config.cnt_click = plerdy_config.cnt_click * 1 + 1;
                                                            } else {
                                                                plerdy_config.cnt_click = plerdy_config.cnt_click * 1 + 1;
                                                            }
                                                        });
                                                    }
                                                    if (_self.form_params.scroll * 1 > 0 && _self.form_params.after_scroll_checked * 1 > 0) {
                                                        _self.properties.showform_when_scroll = 1;
                                                        window.addEventListener("mousemove", function (e) {
                                                            if (_self.properties.showform_when_scroll) {
                                                                var body = document.body,
                                                                    html = document.documentElement;
                                                                docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                                                                position = e.pageY / docHeight * 100;
                                                                if (position >= 20 && position <= 40) {
                                                                    if (_self.form_params.scroll * 1 === 20) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                                if (position >= 41 && position <= 60) {
                                                                    if (_self.form_params.scroll * 1 === 40) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                                if (position >= 61 && position <= 80) {
                                                                    if (_self.form_params.scroll * 1 === 60) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                                if (position >= 81 && position <= 100) {
                                                                    if (_self.form_params.scroll * 1 === 80) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                            }
                                                        });
                                                        window.addEventListener('scroll', function () {
                                                            if (_self.properties.showform_when_scroll) {
                                                                var body = document.body,
                                                                    html = document.documentElement,
                                                                    docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
                                                                    winHeight = window.innerHeight || html.clientHeight,
                                                                    scrollTop = body.scrollTop || html.scrollTop,
                                                                    scrollDistance = scrollTop + winHeight;
                                                                position = scrollDistance / docHeight * 100;
                                                                if (position >= 20 && position <= 40) {
                                                                    if (_self.form_params.scroll * 1 === 20) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                                if (position >= 41 && position <= 60) {
                                                                    if (_self.form_params.scroll * 1 === 40) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                                if (position >= 61 && position <= 80) {
                                                                    if (_self.form_params.scroll * 1 === 60) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                                if (position >= 81 && position <= 100) {
                                                                    if (_self.form_params.scroll * 1 === 80) {
                                                                        _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    _self.showUserCustomPopupForm('', _self.form_params, data.length * 1);
                                                }
                                            }, time * 1000);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, 200);
    };
    this.showLabelButtonPopup = function (formObj) {
        if (PlerdyFormIsShowedButtonLabel === 1 && formObj.label_button_on_off * 1 === 0) {
            return false;
        }
        if (PlerdyFormIsShowedButtonLabel_2 === 1 && formObj.label_button_on_off * 1 === 1) {
            return false;
        }
        if (PlerdyFormIsShowedButtonLabel === 1 && formObj.label_button_on_off * 1 === 0) {
            PlerdyFormIsShowedButtonLabel = 1;
            _self.properties.button_label = 1;
        }
        if (PlerdyFormIsShowedButtonLabel_2 === 1 && formObj.label_button_on_off * 1 === 1) {
            PlerdyFormIsShowedButtonLabel_2 = 1;
            _self.properties.button_label = 1;
        }

        var sendD = {};
        sendD = Object.assign(sendD, _self.properties);
        sendD.f_id = formObj.id;
        sendD.form_id = formObj.id;
        sendD.button_label = 1;
        if (window.country_code_plerdy) {
            sendD.country = window.country_code_plerdy;
        } else {
            sendD.country = '';
        }
        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            var id_page = plerdy_config.id_page;
        } else {
            var id_page = _self.getCookieLocal('id_page') * 1;
        }
        sendD.id_page = id_page;

        var params = encodeURIComponent(JSON.stringify(sendD, null, 2));
        path = _self.properties.plerdy_url + 'get_custom_form?params=' + params;
        var string = ' top:50%; left:50%; transform: translate(-50%,-51%); box-shadow: 0 0 0;';
        if (formObj.label_button_position === 'top_fixed') {
            var string = ' top:0%; left: 50%; transform: translate(-50%);box-shadow: 0 0 0;';
        }
        if (formObj.label_button_position === 'bottom_fixed') {
            var string = ' bottom:0%; left: 50%; top: auto; transform: translate(-50%, -0px);box-shadow: 0 0 0;';
        }
        if (formObj.label_button_position === 'top_left') {
            var string = ' top:0%; left:0%; transform: translate(0px, 0);box-shadow: 0 0 0;';
        }
        if (formObj.label_button_position === 'bottom_left') {
            var string = ' bottom:0%; left:0%; top: auto; transform: translate(0px, 0px);box-shadow: 0 0 0;';
        }
        if (formObj.label_button_position === 'top_right') {
            var string = ' top:0%; right:0%; left: auto; transform: translate(0px, 0);box-shadow: 0 0 0;';
        }
        if (formObj.label_button_position === 'bottom_right') {
            var string = ' bottom:0%; right:0%; left: auto; top: auto; transform: translate(0px, 0px);box-shadow: 0 0 0;';
        }
        if (formObj.label_button_position === 'middele_left_center') {
            if (formObj.label_button_size * 1 === 3) {
                var string = ' top: 50%; left:0%; transform: translate(calc(-49% + 17px - 1%), -50%) rotate(-90deg);box-shadow: 0 0 0;';
            } else if (formObj.label_button_size * 1 === 2) {
                var string = ' top: 50%; left:0%; transform: translate(calc(-49% + 22px - 1%), -50%) rotate(-90deg);box-shadow: 0 0 0;';
            } else {
                var string = ' top: 50%; left:0%; transform: translate(calc(-49% + 25px - 1%), -50%) rotate(-90deg);box-shadow: 0 0 0;';
            }
        }
        if (formObj.label_button_position === 'middle_right_center') {
            if (formObj.label_button_size * 1 === 3) {
                var string = ' top: 50%; right:0%; left: auto; transform: translate(calc((49% - 17px) + 1%), -50%) rotate(-90deg);box-shadow: 0 0 0;';
            } else if (formObj.label_button_size * 1 === 2) {
                var string = ' top: 50%; right:0%; left: auto; transform: translate(calc((49% - 22px) + 1%), -50%) rotate(-90deg);box-shadow: 0 0 0;';
            } else {
                var string = ' top: 50%; right:0%; left: auto; transform: translate(calc((49% - 25px) + 1%), -50%) rotate(-90deg);box-shadow: 0 0 0;';
            }
        }
        iframeLabelButton = document.createElement('iframe');
        iframeLabelButton.classList.add('plerdy-modal__popup_label_button');
        iframeLabelButton.src = path;
        iframeLabelButton.style = 'opacity:0; border-width:0px !important; overflow-y: hidden; adding: 0px; text-align: 1px; position: fixed; z-index: 2147483645 !important;  height: 100%; width: 100%;  box-shadow: 0 0 20px rgba(0,0,0,0.7); font-family: "Open Sans",sans-serif; ' + string;
        document.querySelector('BODY').appendChild(iframeLabelButton);
        _self.setCookieLocal('form_was_closed_to_button', '1');
    }

    this.showUserCustomPopupForm = function (formShow, formObj, formsCnt) {
        if (formShow === undefined) {
            formShow = '';
        }
        if (formObj === undefined) {
            formObj = {};
        }
        if (formsCnt === undefined) {
            formsCnt = 1;
        }

        if (PlerdyFormIsShowed_2 === 1 && formObj.label_button_on_off * 1 === 1) {
            return false;
        }

        if (PlerdyFormIsShowed === 1 && formObj.label_button_on_off * 1 === 0) {
            if (formObj.show_always + "" === "1" && (formObj.hot_selector && formObj.hot_selector_on_off)) {

            } else {
                return false;
            }
        }
        _self.properties.showform_when_scroll = 0;
        if (formObj.label_button_on_off * 1 === 1 && formsCnt * 1 === 2) {
            if (formObj.label_button_on_off * 1 === 1 && formShow === '' && (formObj.first_show_the_form * 1 === 0 || _self.getCookieLocal('form_was_closed_to_button') * 1 === 1)) {
                _self.showLabelButtonPopup(formObj);
            } else {
                _self.showUserCustomPopupFormDo(formShow, formObj, formsCnt * 1);
            }
        } else {
            if (_self.form_params.label_button_on_off * 1 === 1 && formShow === '' && (formObj.first_show_the_form * 1 === 0 || _self.getCookieLocal('form_was_closed_to_button') * 1 === 1)) {
                _self.showLabelButtonPopup(formObj);
            } else {
                _self.showUserCustomPopupFormDo(formShow, formObj, formsCnt * 1);
            }
        }
    }

    this.showUserCustomPopupFormDo = function (formShow, formObj, formsCnt) {
        _self.setCookieLocal('form_was_closed_to_button', '0');
        _self.properties.button_label = 0;

        var realForm = document.querySelector('.plerdy-modal__popup');
        if (realForm) {
            realForm.parentNode.removeChild(realForm);
        }

        var plerdy_modal__popup_label_button = document.querySelector('.plerdy-modal__popup_label_button');
        if (plerdy_modal__popup_label_button && formsCnt * 1 === 1) {
            plerdy_modal__popup_label_button.parentNode.removeChild(plerdy_modal__popup_label_button);
        }
        if (formsCnt * 1 === 2 && formShow * 1 === 1) {
            if (plerdy_modal__popup_label_button) {
                plerdy_modal__popup_label_button.parentNode.removeChild(plerdy_modal__popup_label_button);
            }
        }

        if (formObj.label_button_on_off * 1 === 0) {
            PlerdyFormIsShowed = 1;
        }
        var sendD = {};
        sendD = Object.assign(sendD, _self.properties);
        sendD.f_id = formObj.id;
        sendD.form_id = formObj.id;
        sendD.button_label = 0;
        if (window.country_code_plerdy) {
            sendD.country = window.country_code_plerdy;
        } else {
            sendD.country = '';
        }
        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            var id_page = plerdy_config.id_page;
        } else {
            var id_page = _self.getCookieLocal('id_page') * 1;
        }
        sendD.id_page = id_page;

        var params = encodeURIComponent(JSON.stringify(sendD, null, 2));
        path = _self.properties.plerdy_url + 'get_custom_form?params=' + params;
        if (_self.form_params.animation_show * 1 === 1 && _self.form_params.animation_type !== 'none' && !window.rrrrrrrr) {
            var string = 'visibility: hidden;';
        } else {
            var string = ' top:50%; left:50%; transform: translate(-50%,-50%);';
        }

        if (formObj.label_button_on_off * 1 === 1 && _self.fe) {
            console.log('_self.fe2:', _self.fe);

            if (_self.fe.restore_from_button * 1 === 1) {
                if (_self.fe.location_show === 'top_fixed') {
                    var string = ' top:0%; left: 50%; transform: translate(-50%);';
                }
                if (_self.fe.location_show === 'bottom_fixed') {
                    var string = ' bottom:0%; left: 50%; top: auto; transform: translate(-50%, 0px);';
                }
                if (_self.fe.location_show === 'top_left') {
                    var string = ' top:0%; left:0%; transform: translate(0, 0);';
                }
                if (_self.fe.location_show === 'bottom_left') {
                    var string = ' bottom:0%; left:0%; top: auto; transform: translate(0, 0px);';
                }
                if (_self.fe.location_show === 'top_right') {
                    var string = ' top:0%; right:0%; left: auto; transform: translate(0, 0);';
                }
                if (_self.fe.location_show === 'bottom_right') {
                    var string = ' bottom:0%; right:0%; left: auto; top: auto; transform: translate(0px, 0px); box-shadow: 0 6px 18px rgba(92, 106, 112, 0.35), 0 1px 1px rgba(92, 106, 112, 0.15)';
                }
                if (_self.fe.location_show === 'middele_left_center') {
                    var string = ' top: 50%; left:0%; transform: translate(0, -50%);';
                }
                if (_self.fe.location_show === 'middle_right_center') {
                    var string = ' top: 50%; right:0%; left: auto; transform: translate(0, -50%);';
                }
            } else {
                if (_self.fe.location_show === 'top_fixed') {
                    var string = ' top:0%; left: 50%; transform: translate(-50%);';
                }
                if (_self.fe.location_show === 'bottom_fixed') {
                    var string = ' bottom:0%; left: 50%; top: auto; transform: translate(-50%, 0px);';
                }
                if (_self.fe.location_show === 'top_left') {
                    var string = ' top:0%; left:0%; transform: translate(0, 0);';
                }
                if (_self.fe.location_show === 'bottom_left') {
                    var string = ' bottom:0%; left:0%; top: auto; transform: translate(0, 0px);';
                }
                if (_self.fe.location_show === 'top_right') {
                    var string = ' top:0%; right:0%; left: auto; transform: translate(0, 0);';
                }
                if (_self.fe.location_show === 'bottom_right') {
                    var string = ' bottom:0%; right:0%;  top: auto; left: auto; transform: translate(0px, 0px); box-shadow: 0 6px 18px rgba(92, 106, 112, 0.35), 0 1px 1px rgba(92, 106, 112, 0.15)';
                }
                if (_self.fe.location_show === 'middele_left_center') {
                    var string = ' top: 50%; left:0%; transform: translate(0, -50%);';
                }
                if (_self.fe.location_show === 'middle_right_center') {
                    var string = ' top: 50%; right:0%; left: auto; transform: translate(0, -50%);';
                }
            }
            div = document.createElement('iframe');
            div.scrolling = 'no';
            div.frameborder = 'no';
            div.classList.add('plerdy-modal__popup');
            div.classList.add('animated');
            div.classList.add(_self.fe.animation);
            div.src = path;

            overlay = document.createElement('div');
            overlay.classList.add('plerdy-modal__popup-overlay');
            overlay.id = 'plerdy-modal__popup-overlay_id';
            addStyle_Plerdy('#plerdy-modal__popup-overlay_id {position: fixed; top: 0; left: 0;width: 100%; height: 100%; z-index: 2147483640;}', 'plerdy-modal__popup-overlay_id');
            if (_self.fe.background_popup_on_off * 1 == 1) {
                if (_self.fe.template_params || 1 * _self.fe.type_template === -1) {
                    div.style = _self.fe.template_params + ';border-width:0px !important; width: 100% !important; height:100% !important; z-index: 9999999999 !important; border:none !important;';
                } else {
                    div.style = 'border-width:0px !important;width: 100% !important; height:100% !important; z-index: 9999999999 !important; border:none !important;';
                }
                var StyleN = '';
                if (_self.fe.background_popup_color) {
                    StyleN = 'background: #' + _self.fe.background_popup_color.replace('#', '') + ';';
                }

                if (_self.fe.background_popup_opacity) {
                    StyleN = StyleN + ' opacity:' + _self.fe.background_popup_opacity + ';';
                }
                overlay.style = StyleN;
                console.log('overlay.style.opacity before888:', overlay.style.opacity);
            } else {
                overlay.style.pointerEvents = 'none';
            }
            if (_self.fe.type_template * 1 === 15) {
                div.style = 'opacity:0; border-width:0px !important; overflow-y: hidden; adding: 0px; text-align: 1px; position: fixed; z-index: 9999999999 !important;  height: 100%; width: 100%;  box-shadow: none; font-family: "Open Sans",sans-serif; ' + string;
            } else {
                div.style = 'opacity:0; border-width:0px !important; overflow-y: hidden; adding: 0px; text-align: 1px; position: fixed; z-index: 9999999999 !important;  height: 100%; width: 100%;  box-shadow: 0 0 20px rgba(0,0,0,0.7); font-family: "Open Sans",sans-serif; ' + string;
            }

            overlay.style.opacity = 0;
            document.querySelector('BODY').appendChild(overlay);
            setTimeout(() => {
                overlay.style.opacity = 0.2;

                if (_self.fe.background_popup_opacity) {
                    overlay.style.opacity = _self.fe.background_popup_opacity;
                } else {
                    overlay.style.opacity = 0.3;
                }
            }, 500);
            document.querySelector('BODY').appendChild(div);
        } else {
            var div = document.createElement('iframe');
            div.scrolling = 'no';
            div.frameborder = 'no';
            div.classList.add('plerdy-modal__popup');
            if (_self.form_params.animation_show * 1 === 1 && _self.form_params.animation_type !== 'none' && !window.rrrrrrrr) {
                //якщо є анімація додаєм класс pl_animation
                div.classList.add('pl_animation');
                //який варіант анімації передаєм з адмінки значення data-value приклад: data-value="zoom"
                div.classList.add('pl_' + _self.form_params.animation_type);
                //розташування форми відносно window
                div.classList.add('pl_' + _self.form_params.location_show);
                div.classList.add(_self.form_params.animation);
            } else {
                if (_self.form_params.restore_from_button * 1 === 1) {
                    if (_self.form_params.location_show === 'top_fixed') {
                        var string = ' top:0%; left: 50%; transform: translate(-50%);';
                    }
                    if (_self.form_params.location_show === 'bottom_fixed') {
                        var string = ' bottom:0%; left: 50%; top: auto; transform: translate(-50%, 0px);';
                    }
                    if (_self.form_params.location_show === 'top_left') {
                        var string = ' top:0%; left:0%; transform: translate(0, 0);';
                    }
                    if (_self.form_params.location_show === 'bottom_left') {
                        var string = ' bottom:0%; left:0%; top: auto; transform: translate(0, 0px);';
                    }
                    if (_self.form_params.location_show === 'top_right') {
                        var string = ' top:0%; right:0%; left: auto; transform: translate(0, 0);';
                    }
                    if (_self.form_params.location_show === 'bottom_right') {
                        var string = ' bottom:0%; right:0%; left: auto; top: auto; transform: translate(0px, 0px); box-shadow: 0 6px 18px rgba(92, 106, 112, 0.35), 0 1px 1px rgba(92, 106, 112, 0.15)';
                    }
                    if (_self.form_params.location_show === 'middele_left_center') {
                        var string = ' top: 50%; left:0%; transform: translate(0, -50%);';
                    }
                    if (_self.form_params.location_show === 'middle_right_center') {
                        var string = ' top: 50%; right:0%; left: auto; transform: translate(0, -50%);';
                    }
                } else {
                    // main position form
                    if (_self.form_params.location_show === 'top_fixed') {
                        var string = ' top:0%; left: 50%; transform: translate(-50%);';
                    }
                    if (_self.form_params.location_show === 'bottom_fixed') {
                        var string = ' bottom:0%; left: 50%; top: auto; transform: translate(-50%, 0px);';
                    }
                    if (_self.form_params.location_show === 'top_left') {
                        var string = ' top:0%; left:0%; transform: translate(0, 0);';
                    }
                    if (_self.form_params.location_show === 'bottom_left') {
                        var string = ' bottom:0%; left:0%; top: auto; transform: translate(0, 0px);';
                    }
                    if (_self.form_params.location_show === 'top_right') {
                        var string = ' top:0%; right:0%; left: auto; transform: translate(0, 0);';
                    }
                    if (_self.form_params.location_show === 'bottom_right') {
                        var string = ' bottom:0%; right:0%; left: auto; top: auto; transform: translate(0px, 0px); box-shadow: 0 6px 18px rgba(92, 106, 112, 0.35), 0 1px 1px rgba(92, 106, 112, 0.15)';
                    }
                    if (_self.form_params.location_show === 'middele_left_center') {
                        var string = ' top: 50%; left:0%; transform: translate(0, -50%);';
                    }
                    if (_self.form_params.location_show === 'middle_right_center') {
                        var string = ' top: 50%; right:0%; left: auto; transform: translate(0, -50%);';
                    }
                }
            }

            overlay = document.createElement('div');
            overlay.classList.add('plerdy-modal__popup-overlay');
            overlay.id = 'plerdy-modal__popup-overlay_id';
            addStyle_Plerdy('#plerdy-modal__popup-overlay_id {position: fixed; top: 0; left: 0;width: 100%; height: 100%; z-index: 2147483640;}', 'plerdy-modal__popup-overlay_id');
            if (_self.form_params.background_popup_on_off * 1 == 1) {
                if (_self.form_params.template_params || 1 * _self.form_params.type_template === -1) {
                    div.style = _self.form_params.template_params + ';border-width:0px !important; width: 100% !important; height:100% !important; z-index: 9999999999 !important; border:none !important;';
                } else {
                    div.style = 'border-width:0px !important;width: 100% !important; height:100% !important; z-index: 9999999999 !important; border:none !important;';
                }
                var StyleN = '';
                if (_self.form_params.background_popup_color) {
                    StyleN = 'background: #' + _self.form_params.background_popup_color.replace('#', '') + ';';
                }
                if (_self.form_params.background_popup_opacity) {
                    StyleN = StyleN + ' opacity:' + _self.form_params.background_popup_opacity + ';';
                }
                overlay.style = StyleN;
            } else {
                overlay.style.pointerEvents = 'none';
            }
            if (_self.form_params.type_template * 1 === 10) {
                string = string + '; width:' + _self.form_params.form_width + 'px;';
                string = string + '; height:' + _self.form_params.form_height + 'px;';
                string = string + '; border-radius:' + _self.form_params.border_radius + 'px;';
                string = string + '; box-shadow : none !important';

                div.width = _self.form_params.form_width + 'px';
                div.height = _self.form_params.form_height + 'px';
                div.style.width = _self.form_params.form_width + 'px';
                div.style.height = _self.form_params.form_height + 'px';
                div.style.borderRadius = _self.form_params.border_radius + 'px';
                div.style = 'opacity:1; border-width:0px !important; overflow-y: hidden; adding: 0px; text-align: 1px; position: fixed; z-index: 9999999999 !important;  height: 100%; width: 100%;  box-shadow: 0 0 20px rgba(0,0,0,0.7); font-family: "Open Sans",sans-serif; ' + string;
            } else {
                if (_self.form_params.animation_show * 1 === 1 && _self.form_params.animation_type !== 'none' && !window.rrrrrrrr) {
                    var opacity = "";
                } else {
                    var opacity = "opacity:0;";
                }
                if (_self.form_params.type_template * 1 === 15) {
                    div.style = opacity + ' border-width:0px !important; overflow-y: hidden; adding: 0px; text-align: 1px; position: fixed; z-index: 9999999999 !important;  height: 100%; width: 100%;  box-shadow: none; font-family: "Open Sans",sans-serif; ' + string;
                } else {
                    div.style = opacity + ' border-width:0px !important; overflow-y: hidden; adding: 0px; text-align: 1px; position: fixed; z-index: 9999999999 !important;  height: 100%; width: 100%;  box-shadow: 0 0 20px rgba(0,0,0,0.7); font-family: "Open Sans",sans-serif; ' + string;
                }
            }

            div.src = path;

            overlay.style.opacity = 0;
            document.querySelector('BODY').appendChild(div);
            setTimeout(() => {
                if (_self.form_params.background_popup_opacity) {
                    overlay.style.opacity = _self.form_params.background_popup_opacity;
                } else {
                    overlay.style.opacity = 0.3;
                }
            }, 500);
            document.querySelector('BODY').appendChild(overlay);
            div.onload = function () {
                setTimeout(function () {
                    if (_self.form_params && _self.form_params.animation_show * 1 === 1 && _self.form_params.animation_type !== 'none') {
                        addPlerdyStylesheetTag(mainScriptPlerdy_host + '/public/assets/global/css/animation_form.css', function () {
                            //
                            window.rrrrrrrr = 1;
                        });
                    }
                }, 1500)
            };
        }

    }

    /**
     * hide custom users form and set cookie to prevent show form/
     * @returns void
     */
    this.hideCustomForm = function (type_close, hide, data_send, create_date, label_button_on_off, id) {
        if (type_close === undefined) {
            type_close = 0;
        }
        if (hide === undefined) {
            hide = 1;
        }
        if (data_send === undefined) {
            data_send = 0;
        }
        if (create_date === undefined) {
            create_date = null;
        }
        if (label_button_on_off === undefined) {
            label_button_on_off = 0;
        }
        if (id === undefined) {
            id = _self.form_params.id;
        }
        var x = document.querySelector('.plerdy-modal__popup-overlay');
        if (x && x.parentNode) {
            x.parentNode.removeChild(x);
        }
        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            var id_page = plerdy_config.id_page;
        } else {
            var id_page = _self.getCookieLocal('id_page') * 1;
        }
        _self.properties.id_page = id_page;
        _self.properties.data_send = data_send;
        _self.properties.traffic_source = plerdy_config.traffic_source;
        _self.properties.type_close = type_close;

        var sendD = {};
        sendD = Object.assign(sendD, _self.properties);
        sendD.f_id = id;
        sendD.form_id = id;
        if (window.country_code_plerdy) {
            sendD.country = window.country_code_plerdy;
        } else {
            sendD.country = '';
        }

        var params = encodeURIComponent(JSON.stringify(sendD, null, 2));
        if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
            path = _self.properties.plerdy_url_save_test + 'custom_form_hide?params=' + params;
        } else {
            path = _self.properties.plerdy_url_save + 'custom_form_hide?params=' + params;
        }
        _self.sendget(path, 'text/html', function (data) {
            var form_ga_url = false;

            if (_self.form_params !== undefined) {
                form_ga_url = _self.form_params.ga_url;
            }
            if (_self.fe !== undefined) {
                form_ga_url = _self.fe.ga_url
            }
            data = JSON.parse(data);
            if (data.form && data.form.iframe_share) {
                var ifr = document.querySelector("[src*='click/iframe?user_id=']");
                if (ifr) {
                    ifr.parentNode.removeChild(ifr);
                    var location_url = data.form.redirect_after_filling_out_the_form;
                    if (location_url) {
                        var AAAA = document.createElement('A');
                        AAAA.href = location_url;
                        AAAA.style.width = "0 px";
                        AAAA.style.height = "0 px";
                        document.body.appendChild(AAAA);
                        if (data.form.type_template + "" === '14') {
                            if (data.form.type_template.redirect_status + '' === '1') {
                                AAAA.click();
                            }
                        } else {
                            AAAA.click();
                        }
                        document.body.removeChild(AAAA);
                    }
                }

            }
            _self.SendGoogleAnalytics(data_send, create_date, form_ga_url);
        });
        if (label_button_on_off * 1 === 1 && _self.fe) {
            if (id * 1 === _self.fe.id * 1) {
                if (hide) {
                    if (_self.fe.label_button_hide_after_show * 1 === 0) {
                        if (_self.fe.repeat_show * 1 > 0) {
                            _self.setCookie(_self.properties.cookie_form_show, 'hide', 0, _self.fe.repeat_show * 3600 * 24);
                        } else {
                            _self.setCookie(_self.properties.cookie_form_show, 'hide');
                        }
                    } else {
                        if (data_send) {
                            if (_self.fe.repeat_show * 1 > 0) {
                                _self.setCookie(_self.properties.cookie_form_show, 'hide', 0, _self.fe.repeat_show * 3600 * 24);
                            } else {
                                _self.setCookie(_self.properties.cookie_form_show, 'hide');
                            }
                        } else {
                            _self.setCookieLocal('form_was_closed_to_button', '1');
                        }
                    }

                }
            }
        } else {
            if (_self.form_params && id * 1 === _self.form_params.id * 1) {
                if (hide) {
                    if (_self.form_params.label_button_hide_after_show * 1 === 0) {
                        if (_self.form_params.repeat_show * 1 > 0) {
                            _self.setCookie(_self.properties.cookie_form_show, 'hide', 0, _self.form_params.repeat_show * 3600 * 24);
                        } else {
                            _self.setCookie(_self.properties.cookie_form_show, 'hide');
                        }
                    } else {
                        if (data_send) {
                            if (_self.form_params.repeat_show * 1 > 0) {
                                _self.setCookie(_self.properties.cookie_form_show, 'hide', 0, _self.form_params.repeat_show * 3600 * 24);
                            } else {
                                _self.setCookie(_self.properties.cookie_form_show, 'hide');
                            }
                        } else {
                            _self.setCookieLocal('form_was_closed_to_button', '1');
                        }
                    }

                }
            }
        }
        iframe = document.querySelector('.plerdy-modal__popup');
        if (iframe) {
            iframe.parentNode.removeChild(iframe);
        }

        if (label_button_on_off * 1 === 1 && _self.fe) {
            if (id * 1 === _self.fe.id * 1) {
                if (_self.fe.label_button_on_off * 1 === 1 && _self.fe.label_button_hide_after_show * 1 === 1) {
                    if (!data_send) {
                        PlerdyFormIsShowed_2 = 0;
                        PlerdyFormIsShowedButtonLabel_2 = 0;
                        _self.showLabelButtonPopup(_self.fe);
                    }
                }
            }
        } else {
            if (_self.form_params && id * 1 === _self.form_params.id * 1) {
                if (_self.form_params.label_button_on_off * 1 === 1 && _self.form_params.label_button_hide_after_show * 1 === 1) {
                    if (!data_send) {
                        PlerdyFormIsShowed = 0;
                        PlerdyFormIsShowedButtonLabel = 0;
                        _self.showLabelButtonPopup(_self.form_params);
                    }
                }
            }
        }

    }

    this.getDocHeight = function () {
        var D = document;
        if (location.host === "baby.huggies.ua") {
            var D = document.querySelector('body > div.full-height > div');
            if (D) {
                return Math.max(
                    D.scrollHeight, D.scrollHeight,
                    D.offsetHeight, D.offsetHeight,
                    D.clientHeight, D.clientHeight
                );
            } else {
                return Math.max(
                    D.body.scrollHeight, D.documentElement.scrollHeight,
                    D.body.offsetHeight, D.documentElement.offsetHeight,
                    D.body.clientHeight, D.documentElement.clientHeight
                );
            }
        } else {
            return Math.max(
                D.body.scrollHeight, D.documentElement.scrollHeight,
                D.body.offsetHeight, D.documentElement.offsetHeight,
                D.body.clientHeight, D.documentElement.clientHeight
            );
        }
    }

    this.getDocWidth = function () {
        if (location.host === "baby.huggies.ua") {
            var D = document.querySelector('body > div.full-height > div');
            if (D) {
                return Math.max(
                    D.scrollWidth, D.scrollWidth,
                    D.offsetWidth, D.offsetWidth,
                    D.clientWidth, D.clientWidth
                );
            } else {
                var ww = Math.max(_self.getDocWidthTrue(2), _self.getDocWidthTrue(3), _self.getDocWidthTrue(4), _self.getDocWidthTrue(5), _self.getDocWidthTrue(6));
                var procent = 100 * (_self.getDocWidthTrue(1) * 1 - ww) / _self.getDocWidthTrue(1) * 1;
                if (procent > 50) {
                    return ww;
                } else {
                    return Math.max(_self.getDocWidthTrue(1), ww);
                }
            }
        } else {
            var ww = Math.max(_self.getDocWidthTrue(2), _self.getDocWidthTrue(3), _self.getDocWidthTrue(4), _self.getDocWidthTrue(5), _self.getDocWidthTrue(6));
            var procent = 100 * (_self.getDocWidthTrue(1) * 1 - ww) / _self.getDocWidthTrue(1) * 1;
            if (procent > 50) {
                return ww;
            } else {
                return Math.max(_self.getDocWidthTrue(1), ww);
            }
        }
    }


    this.getDocWidthTrue = function (p) {
        var D = document;
        if (p * 1 == 1) {
            return D.body.scrollWidth;
        }
        if (p * 1 == 2) {
            return D.documentElement.scrollWidth;
        }
        if (p * 1 == 3) {
            return D.body.offsetWidth;
        }
        if (p * 1 == 4) {
            return D.documentElement.offsetWidth;
        }
        if (p * 1 == 5) {
            return D.body.clientWidth;
        }
        if (p * 1 == 6) {
            return D.documentElement.clientWidth;
        }


    }
    /**
     * return current position of mouse click in %, absolute coords and screen width
     * @returns object
     */
    this.getCursorPosition = function (e) {

        var element = (window.plerdyContainer != undefined) ? window.plerdyContainer : 'body';

        //var posx = 0;
        var posy = 0;
        //var TotalX = _self.getDocWidth();
        var TotalY = _self.getDocHeight();
        if (!e) {
            var e = window.event;
        }
        var html = document.documentElement
        var body = document.body

        posy = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        if (!posy) {
            posy = parseInt(e.target.getBoundingClientRect().top);
        }
        if (e.keyCode * 1 === 9) {
            posy = e.target.getBoundingClientRect().top;
        }
        return {
            y: posy,
            totalY: TotalY,
//            x: posx,
//            totalX: TotalX,
//            height: window.screen.height,
//            width: window.screen.width
        };
    };

    this.prossesShow = function (data, scroll) {
        if (scroll === undefined) {
            scroll = '';
        }
        // console.log(data, scroll);
        //  return false;

        // var spiner = document.querySelector('.plerdy_wraper_spiner');
        var pageUrl = getPlerdy_PageUrl();
        var dateFrom = data.params.dateFrom;
        var dateTo = data.params.dateTo;
        var period = data.params.period;
        plerdy_active = data.params.plerdy_active;
        plerdy_inactive = data.params.plerdy_inactive;
        plerdy_direct = data.params.plerdy_direct;
        plerdy_organic = data.params.plerdy_organic;
        plerdy_referral = data.params.plerdy_referral;
        plerdy_social = data.params.plerdy_social;
        plerdy_utm = data.params.plerdy_utm;
        plerdy_other = data.params.plerdy_other;
        plerdy_adwords = data.params.plerdy_adwords;
        plerdy_all_clicks_from_site = data.params.plerdy_all_clicks_from_site;
        var p_orders = data.params.p_orders;
        var device = data.params.device;
        var id = _suid;
        var user_group = data.params.user_group;
        var country_group = data.params.country_group;

        object.setCookieLocal('datepicker_plerdy_from', dateFrom);
        object.setCookieLocal('datepicker_plerdy_to', dateTo);
        object.setCookieLocal('period_plerdy', period);

        var $header = document.querySelector('header');
        if ($header && location.href.indexOf('leleka.com.ua') * 1 === -1) {
            var headerPos = window.getComputedStyle($header).position;
        } else {
            var headerPos = '';
        }
        if ((headerPos === "absolute" || headerPos === "fixed") && _suid * 1 !== 13791) {
            //
        } else {
            plerdy_config.in_p = _self.getCookieLocal('in_p');
            plerdy_config.rp = _self.getCookieLocal('rp');

            if (plerdy_config.rp && plerdy_config.rp * 1 === 1) {
                addStyle_Plerdy('body {position: relative; }', 'main_b');
            }
            if (plerdy_config.in_p && plerdy_config.in_p * 1 === 1) {
                addStyle_Plerdy('body {position: initial !important; }', 'main_b');
            }
            if (location.host === 'atlantistravel.co.il') {
                addStyle_Plerdy('body {position: absolute; width: 100%}', 'main_b');
            }
        }
        addStyle_Plerdy('.plerdy_active {background: red !important;opacity: 1; pointer-events:none}', 'p_a');
        addStyle_Plerdy('.plerdy_active_z {pointer-events:none; position: absolute;text-align: right;font-size: 11px;color: #fff;font-family: Arial; font-weight: 700;}', 'p_a_z');

        addStyle_Plerdy('.plerdy_sales > span {padding: 0px 10px 0px 10px}', 'p_sales');

        addStyle_Plerdy('.plerdy_active_z_f {pointer-events:none; position: fixed; z-index: 9000000000;text-align: right;font-size: 11px;color: #fff;font-family: Arial; font-weight: 700;}', 'p_a_z_f');
        addStyle_Plerdy('.plerdy_active_z_f > span { cursor:pointer;  border-radius: 20px; height: 20px; min-width: 20px; text-align: center; line-height: 20px;  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color:#36c6d3; color:#fff; display: block}', 'p_a_z_s_1');

        addStyle_Plerdy('.plerdy_active_z > span {cursor:pointer; border-radius: 0; height: 26px!important; min-width: 26px!important; text-align: center; line-height: 26px!important;  position: absolute; top: 50%;transform: translate(-50%, -50%); left: 50%; background-color:#36c6d3; color:#fff; display: block; background-color: transparent; background-position: center; background-repeat: no-repeat; background-size: contain; box-shadow: none}', 'p_a_z_s');

        addStyle_Plerdy('span.plerdy-gradient_1 {height: 26px!important; min-width: 26px!important; line-height: 26px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_1.svg)}', 'p_grad_1');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_1 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_1t.svg)}', 'p_grad_1t');
        addStyle_Plerdy('span.plerdy-gradient_2 {height: 29px!important; min-width: 29px!important; line-height: 29px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_2.svg)}', 'p_grad_2');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_2 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_2t.svg)}', 'p_grad_2t');
        addStyle_Plerdy('span.plerdy-gradient_3 {height: 32px!important; min-width: 32px!important; line-height: 32px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_3.svg)}', 'p_grad_3');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_3 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_3t.svg)}', 'p_grad_3t');
        addStyle_Plerdy('span.plerdy-gradient_4 {height: 35px!important; min-width: 35px!important; line-height: 35px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_4.svg)}', 'p_grad_4');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_4 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_4t.svg)}', 'p_grad_4t');
        addStyle_Plerdy('span.plerdy-gradient_5 {height: 38px!important; min-width: 38px!important; line-height: 38px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_5.svg)}', 'p_grad_5');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_5 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_5t.svg)}', 'p_grad_5t');
        addStyle_Plerdy('span.plerdy-gradient_6 {height: 41px!important; min-width: 41px!important; line-height: 41px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_6.svg)}', 'p_grad_6');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_6 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_6t.svg)}', 'p_grad_6t');
        addStyle_Plerdy('span.plerdy-gradient_7 {height: 45px!important; min-width: 45px!important; line-height: 45px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_7.svg)}', 'p_grad_7');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_7 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_7t.svg)}', 'p_grad_7t');
        addStyle_Plerdy('span.plerdy-gradient_8 {height: 48px!important; min-width: 48px!important; line-height: 48px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_8.svg)}', 'p_grad_8');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_8 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_8t.svg)}', 'p_grad_8t');
        addStyle_Plerdy('span.plerdy-gradient_9 {height: 51px!important; min-width: 51px!important; line-height: 51px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_9.svg)}', 'p_grad_9');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_9 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_9t.svg)}', 'p_grad_9t');

        //addStyle_Plerdy('.plerdy_active_z > span { cursor:pointer; box-shadow: 1px 1px 4px 0px rgba(0,0,0,.2); border-radius: 20px; height: 20px; min-width: 20px; text-align: center; line-height: 20px;  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color:#36c6d3; color:#fff; display: block;white-space: nowrap;}', 'p_a_z_s');
        // addStyle_Plerdy('.plerdy-gradient_1 {background: linear-gradient(to top right,#18c15e 0%, #18c343 50%);}', 'p_grad_1');
        // addStyle_Plerdy('.plerdy-gradient_2 {background: linear-gradient(to top right,#64c765 0%, #65c865 50%);}', 'p_grad_2');
        // addStyle_Plerdy('.plerdy-gradient_3 {background: linear-gradient(to top right,#accd72 0%, #b7ce73 50%);}', 'p_grad_3');
        // addStyle_Plerdy('.plerdy-gradient_4 {background: linear-gradient(to top right,#d2c664 0%, #d2b765 50%);}', 'p_grad_4');
        // addStyle_Plerdy('.plerdy-gradient_5 {background: linear-gradient(to top right,#eeb154 0%, #eea153 50%);}', 'p_grad_5');
        // addStyle_Plerdy('.plerdy-gradient_6 {background: linear-gradient(to top right,#ffa24e 0%, #ff794d 50%);}', 'p_grad_6');
        // addStyle_Plerdy('.plerdy-gradient_7 {background: linear-gradient(to top right,#ff8f57 0%, #ff8157 50%);}', 'p_grad_7');
        // addStyle_Plerdy('.plerdy-gradient_8 {background: linear-gradient(to top right,#fd7a5e 0%, #fd5d5d 50%);}', 'p_grad_8');
        // addStyle_Plerdy('.plerdy-gradient_9 {background: linear-gradient(to top right,#f86864 0%, #f86363 50%);}', 'p_grad_9');

        addStyle_Plerdy('.plerdy_hovers_number_show {border:dashed 1px; z-index: 1; cursor:pointer}', 'p_h_n_s');
        addStyle_Plerdy('.plerdy_active_z_hovers {pointer-events:none !important; /*border: 1px dashed rgba(3, 71, 241, 0.1); background: rgba(3, 71, 241, 0.1)*/;}', 'p_a_z_h');
        addStyle_Plerdy('.plerdy_active_z_hovers:hover {background: rgba(3, 71, 241, 0.3); border: 1px dashed rgba(3, 71, 241, 0.7); z-index:9999999999 !important}', 'p_a_z_h_h');
        addStyle_Plerdy('.plerdy_active_z_hovers:hover > .plerdy_hovers_number_show {border:dashed 2px; border-radius:46px !important; height:46px !important; min-width:46px !important; pointer-events:all !important; font-size:18px !important; line-height:46px !important; background-color:#40527d99 !important; cursor:pointer; z-index:9999999999 !important}', 'p_a_z_h_1');
//        addStyle_Plerdy('.pulse_plerdy {-webkit-animation-name: pulsation; -webkit-animation-duration: 1s; -webkit-animation-iteration-count: infinite; animation-name: pulsation;  animation-duration: 1s; animation-iteration-count: infinite;}  @-webkit-keyframes pulsation {0% {box-shadow: 0 0 0px #000;} 50% {box-shadow: 0 0 30px #000;} 100% {box-shadow: 0 0 0px #000;}}', 'pulse');
//        addStyle_Plerdy('.pulse_plerdy {-webkit-animation-name: pulsation; -webkit-animation-duration: 1s; -webkit-animation-iteration-count: infinite; animation-name: pulsation;  animation-duration: 1s; animation-iteration-count: infinite; }  @keyframes pulsation {0% {box-shadow: 0 0 0px #000;} 50% {box-shadow: 0 0 30px #000;} 100% {box-shadow: 0 0 0px #000;}}', 'pulse');

        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            var id_page = plerdy_config.id_page;
        } else {
            var id_page = object.getCookieLocal('id_page') * 1;
        }
        var pageUrl1 = encodeURIComponent(pageUrl);
        if (scroll === 'scroll') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click/panel/scroll_2.0?client_side=1&id=' + id + '&filters[id_page]=' + id_page
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_active]=' + plerdy_active + '&filters[plerdy_inactive]=' + plerdy_inactive
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic
                + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social
                + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other
                + '&filters[plerdy_adwords]=' + plerdy_adwords + '&filters[period]=' + period + '&filters[user_group]=' + user_group, prossesRequestScroll);
        } else if (scroll === 'sales_buy_count') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click/panel/scroll_sales_buy_count?client_side=1&id=' + id + '&filters[id_page]=' + id_page
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_active]=' + plerdy_active + '&filters[plerdy_inactive]=' + plerdy_inactive
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic
                + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social
                + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other
                + '&filters[plerdy_adwords]=' + plerdy_adwords + '&filters[period]=' + period, prossesRequestScroll);
        } else if (scroll === 'depth') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click/panel/scroll_depth_2.0?client_side=1&id=' + id + '&filters[id_page]=' + id_page
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo
                + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_active]=' + plerdy_active + '&filters[plerdy_inactive]=' + plerdy_inactive
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic
                + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social
                + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other
                + '&filters[plerdy_adwords]=' + plerdy_adwords + '&filters[period]=' + period + '&filters[user_group]=' + user_group, prossesRequestScrollDepth);
        } else if (scroll === 'mouse_in_regions') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click/panel/mouse_in_regions_2.0?client_side=1&id=' + id
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other + '&filters[plerdy_adwords]=' + plerdy_adwords
                + '&filters[id_page]='
                + id_page + '&filters[period]=' + period + '&filters[user_group]=' + user_group, prossesRequestMouseInRerions);
        } else if (scroll === 'mouse_select') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/show_text_select?client_side=1&id=' + id
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other + '&filters[plerdy_adwords]=' + plerdy_adwords
                + '&filters[id_page]=' + id_page + '&filters[period]=' + period + '&filters[user_group]=' + user_group, prossesRequest);
        } else if (scroll === 'sales') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/show_sales_clicks?client_side=1&id=' + id
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other + '&filters[plerdy_adwords]=' + plerdy_adwords
                + '&filters[id_page]=' + id_page + '&filters[period]=' + period, prossesRequest);
        } else if (scroll === 'click_plerdy_seo_top') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/seo/get/page_data_front/' + _suid + '/' + id_page + "?url=" + pageUrl1, prossesTopWordsRequest);
        } else if (scroll === 'click_plerdy_seo_stop') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/seo/get/page_data_front/' + _suid + '/' + id_page + "?url=" + pageUrl1, prossesStopWordsRequest);
        } else if (scroll === 'click_plerdy_seo_top_unical') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/seo/get/page_data_front/' + _suid + '/' + id_page + "?url=" + pageUrl1, prossesTopWordsUnicalRequest);
        } else if (scroll === 'new_clicks') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click_group?id=' + id
                + '&f[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&f[page_url]=' + pageUrl1
                + '&f[plerdy_active]=' + plerdy_active + '&f[plerdy_inactive]=' + plerdy_inactive
                + '&f[plerdy_direct]=' + plerdy_direct + '&f[plerdy_organic]=' + plerdy_organic + '&f[plerdy_referral]=' + plerdy_referral + '&f[plerdy_social]=' + plerdy_social + '&f[plerdy_utm]=' + plerdy_utm + '&f[plerdy_other]=' + plerdy_other + '&f[plerdy_adwords]=' + plerdy_adwords
                + '&f[id_page]=' + id_page + '&f[click_order]=' + p_orders + '&f[period]=' + period + '&f[user_group]=' + user_group
                + "&f[country_group]=" + country_group
                + '&f[dataLevel]=' + data.params.sendDataObj.dataLevel + "&f[dataNode]=" + data.params.sendDataObj.dataNode
                + '&f[dataNum]=' + data.params.sendDataObj.dataNum + "&f[dataCnt]=" + data.params.sendDataObj.dataCnt, prossesGroupRequest);
        } else if (scroll === 'new_clicks2') {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click_group2?id=' + id
                + '&f[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&f[page_url]=' + pageUrl1
                + '&f[plerdy_active]=' + plerdy_active + '&f[plerdy_inactive]=' + plerdy_inactive
                + '&f[plerdy_direct]=' + plerdy_direct + '&f[plerdy_organic]=' + plerdy_organic + '&f[plerdy_referral]=' + plerdy_referral + '&f[plerdy_social]=' + plerdy_social + '&f[plerdy_utm]=' + plerdy_utm + '&f[plerdy_other]=' + plerdy_other + '&f[plerdy_adwords]=' + plerdy_adwords
                + '&f[id_page]=' + id_page + '&f[click_order]=' + p_orders + '&f[period]=' + period + '&f[user_group]=' + user_group
                + "&f[country_group]=" + country_group
                + '&f[dataLevel]=' + data.params.sendDataObj.dataLevel + "&f[dataNode]=" + data.params.sendDataObj.dataNode
                + "&f[dataNode2]=" + data.params.sendDataObj.dataNode2, prossesGroupRequest2);
        } else if (scroll === 'canvas') {
            let plSegment = "tags_2.0";
            if (window.plerdy_hash_version) {
                plSegment = "tags_hash";
            }
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click/panel/' + plSegment + '?client_side=1&id=' + id
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_active]=' + plerdy_active + '&filters[plerdy_inactive]=' + plerdy_inactive
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other + '&filters[plerdy_adwords]=' + plerdy_adwords
                + '&filters[plerdy_all_clicks_from_site]=' + plerdy_all_clicks_from_site + '&filters[id_page]='
                + id_page + '&filters[click_order]=' + p_orders + '&filters[period]=' + period + '&filters[user_group]=' + user_group + "&filters[country_group]=" + country_group
                + "&show_click_final=" + scroll, prossesCanvasPlerdy);


        } else {
            createCORSRequest('GET', plerdy_config.plerdy_url0 + 'admin/click/panel/tags_2.0?client_side=1&id=' + id
                + '&filters[device]=' + device + '&date_start=' + dateFrom + '&date_finish=' + dateTo + '&filters[page_url]=' + pageUrl1
                + '&filters[plerdy_active]=' + plerdy_active + '&filters[plerdy_inactive]=' + plerdy_inactive
                + '&filters[plerdy_direct]=' + plerdy_direct + '&filters[plerdy_organic]=' + plerdy_organic + '&filters[plerdy_referral]=' + plerdy_referral + '&filters[plerdy_social]=' + plerdy_social + '&filters[plerdy_utm]=' + plerdy_utm + '&filters[plerdy_other]=' + plerdy_other + '&filters[plerdy_adwords]=' + plerdy_adwords
                + '&filters[plerdy_all_clicks_from_site]=' + plerdy_all_clicks_from_site + '&filters[id_page]='
                + id_page + '&filters[click_order]=' + p_orders + '&filters[period]=' + period + '&filters[user_group]=' + user_group + "&filters[country_group]=" + country_group
                + "&show_click_final=" + scroll, prossesRequest);
        }
    };

    this.prossesHideSeo = function () {
        var no_seo_data_mes = document.querySelector('#no_seo_data_mes');
        if (no_seo_data_mes) {
            no_seo_data_mes.style.display = 'none';
        }
        try {
            var instance = new Mark(document.querySelector("body"));
            instance.unmark();
        } catch (e) {

        }
    };

    this.processHide = function () {
        previous_data = [];
        selectors = [];
        selectors_hovers = [];
        plerdySelectorsArray = [];
        var plerdy_elements = document.querySelectorAll('.plerdy_active_z');
        if (plerdy_elements && plerdy_elements.length * 1 > 0) {
            plerdy_elements.forEach(function (item) {
                item.remove();
            });
        }
        selectors = [];
        selectors_hovers = [];
        var dataI = document.querySelectorAll('[data-i]');
        if (dataI && dataI.length * 1 > 0) {
            dataI.forEach(function (item) {
                item.removeAttribute('data-i');
            });
        }
        var dataPlerdynum = document.querySelectorAll('[data-plerdynum]');
        if (dataPlerdynum && dataPlerdynum.length * 1 > 0) {
            dataPlerdynum.forEach(function (item) {
                item.removeAttribute('data-plerdynum');
            });
        }
        var dataPlerdyOvered = document.querySelectorAll('[data-overed]');
        if (dataPlerdyOvered && dataPlerdyOvered.length * 1 > 0) {
            dataPlerdyOvered.forEach(function (item) {
                item.removeAttribute('data-overed');
            });
        }
        var dataPlerdyClosed = document.querySelectorAll('[data-plerdyclosed]');
        if (dataPlerdyClosed && dataPlerdyClosed.length * 1 > 0) {
            dataPlerdyClosed.forEach(function (item) {
                item.removeAttribute('data-plerdyclosed');
            });
        }
        var dd = document.querySelector('#plerdy_show_on_mouse_hover');
        if (dd) {
            dd.setAttribute('style', 'display:none');
        }
        try {
            if (window.el2) {
                window.el2.style.border = 'none';
            }
        } catch (e) {
        }

        let click_plerdy_Canvas = document.getElementById("click_plerdy_Canvas");
        if (click_plerdy_Canvas) {
            click_plerdy_Canvas.parentNode.removeChild(click_plerdy_Canvas);
        }

    };

    /**
     * hide gradient scroll
     * @returns void
     */
    this.processHideScroll = function () {
        previous_data = [];
        selectors = [];
        selectors_hovers = [];
        plerdySelectorsArray = [];
        var plerdy_canvas = document.querySelector('#plerdy_canvas');
        if (plerdy_canvas) {
            plerdy_canvas.parentNode.removeChild(plerdy_canvas);
        }
        var plerdy_canvas = document.querySelector('#plerdy_canvas1');
        if (plerdy_canvas) {
            plerdy_canvas.parentNode.removeChild(plerdy_canvas);
        }
        for (var i = 0; i < 5; i++) {
            var el = document.querySelector('#plerdy_first_div_' + i);
            if (el) {
                el.parentNode.removeChild(el);
            }
        }
        for (var i = 0; i < 10; i++) {
            var el = document.querySelector('#plerdy_first_div_depth_' + i);
            if (el) {
                el.parentNode.removeChild(el);
            }
        }
    }

    this.prossesHideMouseInRegions = function () {

    }


    this.proccesClick = function (event, callback, el2) {
        if (window.plerdyDetectWrongCountry && window.plerdyDetectWrongCountry * 1 === 1) {
            return;
        }
        if (el2 === undefined) {
            el2 = '';
        }
        var btnCode = event.button;
        switch (btnCode) {
            case 0:
                break;
            default:
                if (event.target.id == 'plerdy_show' || event.target.id == 'plerdy_hide' || event.target.id == 'plerdy_scroll' || event.target.id == 'plerdy_logout') {
                    event.preventDefault();
                    return false;
                }
        }

        if ((event.target.tagName !== 'use' && event.target.tagName !== 'svg' && event.target.tagName !== 'path' && event.target.tagName !== 'polygon') && _self.strstr(event.target.className, 'plerdy_form_error')) {
            event.target.classList.remove("plerdy_form_error");
            return false;
        }
        if ((event.target.tagName !== 'use' && event.target.tagName !== 'svg' && event.target.tagName !== 'path' && event.target.tagName !== 'polygon') &&
            (_self.strstr(event.target.className, 'plerdy_element_for_send') || _self.strstr(event.target.className, 'plerdy_form_custom'))) {
            return false;
        }
        /* all dropdowns  */
        switch (event.target.id) {
            case 'plerdy_hide_popup_info_click':
                var div = document.querySelector('#plerdy_show_on_mouse_hover');
                if (div) {
                    var dn = document.querySelector("[data-ad_event='1'][data-nummm]");
                    if (dn) {
                        dn = dn.dataset.nummm;
                        dn = document.querySelector("[data-plerdynum='" + dn + "']");
                        if (dn) {
                            dn = dn.dataset.plerdyclosed = 1;
                        }
                    }
                    div.parentNode.removeChild(div);
                }
                break;

            case 'plerdy_m_close':
                document.querySelector('#plerdy_m_popup1').parentNode.removeChild(document.querySelector('#plerdy_m_popup1'));
                break;
            /*hide custom form only*/
            case 'plerdy_m_popup1':
                document.querySelector('#plerdy_m_popup1').parentNode.removeChild(document.querySelector('#plerdy_m_popup1'));
                break;
            /*hide custom form only*/
            case 'plerdy-modal__popup-overlay_id':
                if (_self.form_params.close_button * 1 === 0) {
                    break;
                }
                if (_self.form_params.background_popup_on_off * 1 === 0) {
                    break;
                }

                if (_self.form_params.label_button_on_off * 1 === 1) {
                    _self.hideCustomForm(2, 0, 0, null, 1); //фон
                } else if (_self.fe && _self.fe.label_button_on_off * 1 === 1) {
                    _self.hideCustomForm(2, 0, 0, null, 1, _self.fe.id); //фон
                } else {
                    _self.hideCustomForm(2, 1, 0, null, 0);//fon
                    //_self.hideCustomForm(2, 0, 0, null,0); //фон
                }

                break;

            case 'plerdy_form_for_get_data':
                return false;
                break;
            case 'plerdy_send_form_data':
                if (btnCode * 1 === 0) {
                    _self.sendDatatoServerFromCustomForm();
                }
                break;
            case 'plerdy_send_form_data_1':
                if (btnCode * 1 === 0) {
                    _self.sendDatatoServerFromCustomForm(1);
                }
                break;
            case 'plerdy_send_form_data_2':
                if (btnCode * 1 === 0) {
                    _self.sendDatatoServerFromCustomForm(2);
                }
                break;
            default:
                if (el2) {
                    var target = el2;
                } else {
                    var target = _self.getTarget(event);
                }
                if (target) {
                    if (typeof plerdy_ga_events !== 'undefined') {
                        if (plerdy_ga_events.length * 1 >= 1) {
                            plerdy_send_gaEvents(target);
                        }
                    }
                    if (target.parentElement) {
                        if (target.parentElement.tagName === 'A' && target.tagName === 'SPAN') {
                            target = target.parentElement;
                        }

                    }
                    // Саме по два рази потрібно, бо масиви переставляються місцями!!!!!
                    var t_n = _self.getAllElementProperty(target, 'nodeName');
                    var ch_n = _self.getAllElementProperty(target, 'childNum');

                    /// checking for valid selectors
                    var t_n2 = _self.getAllElementProperty(target, 'nodeName');
                    var ch_n2 = _self.getAllElementProperty(target, 'childNum');
                    if (plerdy_tags_arr[t_n2[0]] === undefined) {
                        return false;
                    }
                    var selectorM = _self.generateSelectorByMyFunction(t_n2, ch_n2);
                    try {
                        var realEl = document.querySelector(selectorM);
                        if (realEl) {
                            //
                        } else {
                            return false;
                        }
                    } catch (err) {
                        return false;
                    }
                    /// END checking for valid selectors

                    if (on_off_mode_show * 1 === 1) {

                    } else {
                        var NOWpledyTimeOfClick = Math.round(new Date().getTime()); /*miliseconds*/
                        if (NOWpledyTimeOfClick - pledyTimeOfClick < 500) {
                            //console.log(1);
                            return false;
                        }
                        if (mobileAndTabletcheck()) {
                            _self.properties.device = 'tablet';
                        }
                        if (mobilecheck()) {
                            _self.properties.device = 'mobile';
                        }

                        if (_self.properties.device === 'mobile' || _self.properties.device === 'tablet') {
                            if (btnCode * 1 !== 0) {
                                return false;
                            }
                        }

                        try {
                            if (typeof CssSelectorGenerator === "undefined") {
                                _self.properties.reserve_selector.push("");
                            } else {
                                var my_selector_generator = new CssSelectorGenerator;
                                my_selector_generator.setOptions({
                                    selectors: ['id', 'class', 'tag', 'nthchild'],
                                    prefix_tag: true,
                                    class_blacklist: ['.test_two', 'test_two']
                                });
                                _self.properties.reserve_selector.push(my_selector_generator.getSelector(target));
                            }
                        } catch (err) {
                            _self.properties.reserve_selector.push("");
                        }


                        plerdy_click_number_on_page = plerdy_click_number_on_page * 1 + 1;
                        var c_n = _self.getAllElementProperty(target, 'classList').reverse().join(' > ');
                        _self.properties.class_list.push(c_n);

                        var id_list = _self.getAllElementProperty(target, 'id').reverse().join(' > ');
                        _self.properties.id_list.push(id_list)
                        var hash_tag = target.getAttribute('plerdy-tracking-id') || 0;
                        _self.properties.hash_tag.push(hash_tag);
                        /*
                            neuron-toys.com" || boxmode.com" || pod-frenzy.com" || tramontinastore.ae" || theoverwhelmedbrain.com"
                            _self.properties.reserve_selector.push("");
                        */

                        _self.properties.click_number.push(plerdy_click_number_on_page);
                        _self.properties.traffic_source = plerdy_config.traffic_source;
                        _self.properties.position.push(_self.getCursorPosition(event));
                        _self.properties.tag_name.push(t_n);
                        _self.properties.el_on_click.push(plerdy_tags_arr[t_n[0]]);
                        if (typeof (target.className) == 'string') {
                            _self.properties.class_name.push(target.className);
                        } else {
                            _self.properties.class_name.push('');
                        }
                        _self.properties.node_number.push(ch_n);
                        target = event.target;
                        pledyTimeOfClick = Math.round(new Date().getTime());/*miliseconds*/
                        if (callback) {
                            callback(_self.redirectToHref);
                        }
                        break;
                    }
                }
        }

    };

    this.checkIfElementHasSpesifiedTag = function (el, tag) {
        var nodes = el.childNodes;
        var res = false;
        if (nodes) {
            nodes.forEach(function (rr) {
                if (rr.nodeName.indexOf('#') < 0) {
                    if (rr.tagName === tag) {
                        res = rr;
                    }
                }
            });
        }
        return res;
    }

    this.checkIfClickInPanel = function (target) {
        var element_check = target
        while (element_check != null && element_check.nodeName != 'BODY') {
            if (element_check.id == 'plerdy_control_wraper_id') {
                return true;
            }
            element_check = element_check.parentElement;
        }
        return false;
    }

    this.sendDatatoServerFromCustomForm = function (form, location_url, target_blank, wheel, second, plerdyIframeData) {
        if (wheel === undefined) {
            wheel = {};
        }
        if (second === undefined) {
            second = '';
        }
        var smiles = {};
        if (plerdyIframeData.smiles === undefined) {
            smiles.is = false;
        } else {
            smiles.is = true;
            ;
            smiles.smiles = plerdyIframeData.smiles;
        }

        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            id_page = plerdy_config.id_page;
        } else {
            id_page = _self.getCookieLocal('id_page') * 1;
        }
        _self.properties.id_page = id_page;

        var sendLid = false;
        if ((Object.keys(second).length === 0 && second.constructor === Object) || second === '') {
            sendLid = true;
            _self.properties.button_type = 1;
        } else {
            _self.properties.button_type = 2;
            if (second.location_url) {
                if (form && form.length * 1 > 0) {
                    var formFill = 0;
                    for (var ii in form) {
                        if (form[ii].value !== '') {
                            formFill = 1;
                        }
                    }
                    if (formFill) {// форма заповнена
                        sendLid = true;
                    } else {
                        sendLid = false;
                    }
                } else {
                    sendLid = false;
                }
            } else {
                sendLid = true;
            }
        }
        if (window.country_code_plerdy) {
            _self.properties.country = window.country_code_plerdy;
        } else {
            _self.properties.country = '';
        }

        // var params = encodeURIComponent(JSON.stringify(_self.properties));
        // var form = encodeURIComponent(JSON.stringify(form));
        // var wheel = encodeURIComponent(JSON.stringify(wheel));
        // var smiles = encodeURIComponent(JSON.stringify(smiles));
        _self.properties.form_id = plerdyIframeData.form_id;
        var params2 = {};
        params2.params = _self.properties;
        params2.form = form;
        params2.wheel = wheel;
        params2.smiles = smiles;

        params2.user_ses = sesNamePuserSes;

        params2 = encodeURIComponent(JSON.stringify(params2));
        if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
            var path = plerdy_config.plerdy_url_save_test + 'send_data_to_server_from_custom_form';
        } else {
            var path = plerdy_config.plerdy_url_save + 'send_data_to_server_from_custom_form';
        }
        form.id = plerdyIframeData.form_id;
        var location_url;
        var target_blank;
        if (second && (Object.keys(second).length > 0 && second.constructor === Object)) {
            location_url = second.location_url;
            target_blank = second.target_blank;
            if (location_url) {
                var AAAA = document.createElement('A');
                if (location_url.indexOf('tel:') > -1) {
                    AAAA.href = location_url;
                } else {
                    AAAA.href = _protocol + location_url;
                }
                if (target_blank && target_blank * 1 == 1) {
                    AAAA.target = "_blank";
                }
                AAAA.style.width = "0 px";
                AAAA.style.height = "0 px";
                document.body.appendChild(AAAA);
                AAAA.click();
                document.body.removeChild(AAAA);
            }
        }


        if (!location_url) {
            if (sendLid) {
                _self.sendpost(path, 'application/json', function (data1) {
                    if (data1) {
                        var data = JSON.parse(data1);
                        _self.doAfterSend(data, form, location_url, target_blank, wheel, second);
                    }
                }, true, 'params2=' + params2);
            } else {
                _self.doAfterSend({'message': 'ok'}, form, location_url, target_blank, wheel, second);
            }
        } else {
            if (plerdyIframeData.type_template + "" === "3" || plerdyIframeData.type_template + "" === "-1" || plerdyIframeData.type_template + "" === "15" || plerdyIframeData.type_template + "" === "14") {
                form.type_template = plerdyIframeData.type_template;
                _self.doAfterSend({'message': 'ok'}, form, location_url, target_blank, wheel, second);
            }
        }

    };

    this.doAfterSend = function (data, form, location_url, target_blank, wheel, second) {
        if (form.type_template && form.type_template + "" === '14') {
            var create_date = null;
            if (data.create_date != 'undefined') {
                create_date = data.create_date;
            }
            if ((Object.keys(second).length === 0 && second.constructor === Object) || second == '') {
                _self.hideCustomForm(0, 1, 1, create_date, form.label_button_on_off, form.id);
            } else {
                _self.hideCustomForm(0, 1, 3, create_date, form.label_button_on_off, form.id);
            }
            return;
        }

        if (data && data.message == 'ok') {
            if (second && (Object.keys(second).length > 0 && second.constructor === Object)) {
                var location_url = second.location_url;
                var target_blank = second.target_blank;
            }
            if (location_url) {
                var AAAA = document.createElement('A');
                if (location_url.indexOf('tel:') > -1) {
                    AAAA.href = location_url;
                } else {
                    AAAA.href = _protocol + location_url;
                }
                if (target_blank && target_blank * 1 == 1) {
                    AAAA.target = "_blank";
                }
                AAAA.style.width = "0 px";
                AAAA.style.height = "0 px";
                document.body.appendChild(AAAA);
                AAAA.click();
                document.body.removeChild(AAAA);
            }
            var create_date = null;
            if (data.create_date != 'undefined') {
                create_date = data.create_date;
            }
            if ((Object.keys(second).length === 0 && second.constructor === Object) || second == '') {
                _self.hideCustomForm(0, 1, 1, create_date, form.label_button_on_off, form.id);
            } else {
                _self.hideCustomForm(0, 1, 3, create_date, form.label_button_on_off, form.id);
            }
            if (_self.form_params.type_template + "" == '11' || _self.form_params.type_template + "" == '12' || _self.form_params.type_template + "" == '13') {
                _self.showMessage();
            } else {
                if (form.length && _self.form_params.type_template * 1 != -1 && _self.form_params.type_template * 1 != 3) {
                    _self.showMessage();
                }
            }
        }
    }

    this.showMessage = function () {
        formId = 0;
        if (_self.form_params && _self.form_params.id) {
            if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
                var path = plerdy_config.plerdy_url0 + 'click/f_data_was_sended?form_id=' + _self.form_params.id;
            } else {
                var path = plerdy_config.plerdy_url0 + 'click/f_data_was_sended?form_id=' + _self.form_params.id;
            }
        } else {
            var href = location.href;
            href = new URL(href);
            var searchParams = new URLSearchParams(href.search);
            var formId = searchParams.get("form_id");
            if (!formId) {
                var ifr = document.querySelector("[src*='click/iframe?user_id=']");
                if (ifr && ifr.src) {
                    href = ifr.src;
                    href = new URL(href);
                    var searchParams = new URLSearchParams(href.search);
                    var formId = searchParams.get("form_id");
                }
            }
            if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
                var path = plerdy_config.plerdy_url0 + 'click/f_data_was_sended?form_id=' + formId;
            } else {
                var path = plerdy_config.plerdy_url0 + 'click/f_data_was_sended?form_id=' + formId;
            }
        }

        _self.sendget(path, 'text/html', function (data) {
            if (data) {
                var div = document.createElement('DIV');
                div.class = 'plerdy_m_overlay';
                div.id = 'plerdy_m_popup1';
                div.style = 'position: fixed; top: 0px; left: 0px;   width: 100%; z-index:1000000000';
                div.innerHTML = data;
                document.querySelector('BODY').appendChild(div);
                var ww = document.querySelector('#plerdy_second_value_wheel');
                if (ww) {
                    document.querySelector('#plerdy_second_value_wheel').innerHTML = document.querySelector('#plerdy_second_value_wheel').innerHTML + " " + plerdy_config.wheel.value_name;
                }

                if (_self.form_params.redirect_after_filling_out_the_form) {
                    setTimeout(function () {
                        var AAAA = document.createElement('A');
                        AAAA.href = _self.form_params.redirect_after_filling_out_the_form;
                        //AAAA.target="_blank";
                        AAAA.style.width = "0 px";
                        AAAA.style.height = "0 px";
                        document.body.appendChild(AAAA);
                        // console.log(_self.form_params);
                        if (_self.form_params.type_template + "" === '14') {
                            if (_self.form_params.redirect_status + '' === '1') {
                                AAAA.click();
                            }
                        } else {
                            AAAA.click();
                        }
                        document.body.removeChild(AAAA);
                    }, 3000)
                }
            }
        });
    }

    /**
     *
     * @param {object} ob
     * @returns {bollean}
     */
    this.validateDateFromForm = function (ob) {
        var required = ob.getAttribute('requried') !== null;
        if (ob.value.length > ob.maxlength || (ob.value.length < 1 && required)) {
            if (ob.parentNode && ob.parentNode.style.display == 'none') {
                return true;
            } else {
                return false;
            }
        }
        if (ob.type === 'email') {
            var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return re.test(ob.value.toLowerCase());
        }
        if (ob.type === 'tel' && ob.value.toLowerCase().length > 21) {
            return false;
        }
        if (ob.type === 'tel' && ob.value.length > 1 && required) {
            var re = /^(\d|\+|\)|\(|-)+$/;
            return re.test(ob.value.toLowerCase());
        }
        if (ob.type === 'checkbox' && required) {
            return ob.checked;
        }


        return true;
    }

    this.getAllElementProperty = function (el, prop) {

        var res = [];
        if (prop == 'childNum') {
            res.push(_self.getElementChildNumber(el));
        } else {
            if (prop == "id") {
                res.push(el.id);
            } else if (prop == "classList") {
                res.push(el[prop]['value']);
            } else {
                res.push(el[prop]);
            }
        }

        var parent = el.parentElement;
        if (parent) {
            while (parent && parent.nodeName !== 'BODY') {

                if (parent.nodeName.indexOf('function') > -1) {

                } else {
                    if (prop == 'childNum') {
                        res.push(_self.getElementChildNumber(parent));
                    } else {
                        if (prop == "id") {
                            res.push(parent.id);
                        } else if (prop == "classList") {
                            res.push(parent[prop]['value']);
                        } else {
                            res.push(parent[prop]);
                        }
                    }
                }

                parent = parent.parentElement;
            }
        }
        return res;
    }

    this.getElementChildNumber = function (child) {
        var i = 1;
        while ((child = child.previousSibling) != null) {
            if (child.nodeName.indexOf('#') < 0) {
                i++;
            }
        }
        return i;

    }

    /**
     * * wached by click
     * @param {string} callback
     * @returns void
     */
    this.event_click = function (callback) {
        if (callback === undefined) {
            callback = '';
        }
        var d = 1;

        if (location.host === "27.ua" || location.host === 'start.workfusion.com'
            || location.host === 'jabko.ua'
            || location.host === 'amigovet.net'
            || location.host === 'woodandhearts.com'
            || location.host === 'pod-frenzy.com') {
            document.addEventListener('pointerdown', function (event) {
                d = 0;
                _self.proccesClick(event, callback);
                console.log(1);
            });
        } else {
            document.addEventListener('mousedown', function (event) {
                d = 0;
                _self.proccesClick(event, callback);
                //            console.log(1);
            });

            document.addEventListener('mouseup', function (event) {
                if (d * 1 === 1) {
                    _self.proccesClick(event, callback);
                    //                console.log(2);
                }
            });
        }
    };

    /**
     *
     * @param {string} url
     * @param {string} type  - json, html, ...
     * @param {string} callback - name of callback function
     * @returns {String|Boolean}
     */
    this.sendget = function (url, type, callback, async, body) {
        if (callback === undefined) {
            callback = '';
        }
        if (async === undefined) {
            async = true;
        }
        if (body === undefined) {
            body = '';
        }
        var xhr = _self.createCORSRequest('GET', url, type, callback, async, body);

        return xhr;
    };

    /**
     *
     * @param {string} url
     * @param {string} type  - json, html, ...
     * @param {string} callback - name of callback function
     * @returns {String|Boolean}
     */
    this.sendpost = function (url, type, callback, async, body) {
        if (callback === undefined) {
            callback = '';
        }
        if (async === undefined) {
            async = true;
        }
        if (body === undefined) {
            body = '';
        }
        var xhr = _self.createCORSRequest('POST', url, type, callback, async, body);

    };

    /**
     * Find first occurrence of a string
     * @param {string} haystack
     * @param {string} needle
     * @param {boolean} bool
     * @returns boolean
     *
     */
    this.strstr = function (haystack, needle, bool) {
        var pos = 0;
        if (typeof haystack != 'string') {
            return true;
        }
        pos = haystack.indexOf(needle);
        if (pos * 1 === -1) {
            return false;
        } else {
            if (bool) {
                return haystack.substr(0, pos);
            } else {
                return haystack.slice(pos);
            }
        }
    };

    /**
     * find & remove protocol (http, ftp, etc.) and get hostname
     * @param {string} url
     * @returns string
     */
    this.get_domain = function (url) {
        var hostname;

        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        } else {
            hostname = url.split('/')[0];
        }

        /*find & remove port number */
        hostname = hostname.split(':')[0];
        /*find & remove "?" */
        hostname = hostname.split('?')[0];

        return hostname;
    };

    /**
     *
     * @param {object} obj1
     * @param {object}  obj2
     * @returns object
     */
    this.merge_options = function (obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }
        for (var attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }
        return obj3;
    };

    /**
     *
     * @param {string} method
     * @param {string} url
     * @param {string} type
     * @param {string} callback
     * @returns {createthis.CORSRequest.xhr|XDomainRequest|XMLHttpRequest}
     */
    this.createCORSRequest = function (method, url, type, callback, async, body) {
        if (async === undefined) {
            async = true;
        }
        if (body === undefined) {
            body = '';
        }
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {

            /* Check if the XMLHttpRequest object has a "withCredentials" property.
             "withCredentials" only exists on XMLHTTPRequest2 objects. */
            xhr.open(method, url, true);

        } else if (typeof XDomainRequest !== "undefined") {

            /* Otherwise, check if XDomainRequest.
             XDomainRequest only exists in IE, and is IE's way of making CORS requests. */
            xhr = new XDomainRequest();
            xhr.open(method, url, async);

        } else {

            /*Otherwise, CORS is not supported by the browser.*/
            xhr = null;

        }

        xhr.onload = function () {
            if (xhr.status * 1 !== 200) {
                return false;
            } else {
                if (callback) {
                    callback(xhr.responseText);
                } else {
                    return xhr.responseText;
                }
            }
        };
        if (body) {
//            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(body);
        } else {
            xhr.send();
        }

        return xhr;

    };

    this.savedatatoStatistica = function (NewformEntity) {

        _self.properties.f_id = NewformEntity.id;
        var params = encodeURIComponent(JSON.stringify(_self.properties, null, 2));
        var cooki = encodeURIComponent(JSON.stringify(_self.readCookieRegExp()));
        if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
            _self.sendget(plerdy_config.plerdy_url_save_test + 'ip?params=' + params + '&cooki=' + cooki + "&ip_a=2", 'application/json', function (data) {

            });
        } else {
            _self.sendget(plerdy_config.plerdy_url_save + 'ip?params=' + params + '&cooki=' + cooki + "&ip_a=2", 'application/json', function (data) {

            });
        }
    }

    var plerdy_resId = false;
    this.sortByLabelButton = function (objArray) {
        for (var i = 0; i < objArray.length; i++) {
            var id = objArray[i];
            if (id === undefined) {
                continue;
            }
            if (id * 1 === NaN) {
                continue;
            }
            if (parseInt(id) === NaN) {
                continue;
            }
            if (parseInt(id * 1) === NaN) {
                continue;
            }
            var item = plerdy_form_data_params[id];
            if (item.form.label_button_on_off * 1 === 1 && !plerdy_resId) {
                plerdy_resId = id;
            }
        }
        var filtered = objArray.filter(function (value, index, arr) {
            return '' + value + "" !== "" + plerdy_resId + "";
        });
        if (plerdy_resId) {
            filtered.unshift('' + plerdy_resId + "");
        }
        return filtered;
    }

    this.rules_forForm = function () {
        var cooki = _self.readCookieRegExp();
        var result = false;
        var form_id = '';
        var NewformEntity = [];
        //plerdy_form_data_params;
        if (typeof plerdy_form_data_params !== 'undefined' && Object.keys(plerdy_form_data_params).length * 1 > 0) {
            var ob = Object.keys(plerdy_form_data_params);

            ob = _self.sortByLabelButton(ob);


            for (var i = 0; i < ob.length; i++) {
                var id = ob[i];
                if (id === undefined) {
                    continue;
                }
                if (id * 1 === NaN) {
                    continue;
                }
                if (parseInt(id) === NaN) {
                    continue;
                }
                if (parseInt(id * 1) === NaN) {
                    continue;
                }
//                if(!Number.isInteger(id*1)){
//                    continue;
//                }
                var item = plerdy_form_data_params[id];
                if (item === undefined) {
                    continue;
                }
                if (item.form.iframe_share * 1 === 1 && plerdy_resId * 1 === 0) {
                    continue;
                }
                if (result) {
                    continue;
                }
                if (item.block_ip) {
                    item.block_ip = item.block_ip + "|";
                    if (item.block_ip.indexOf(object.properties.ip_visitor + "|") > -1) {
                        result = false;
                        continue;
                    }
                }
                resultTraffikBed = 1;
                if (item.traffic_source.ts.length * 1 === 0 || item.traffic_source.ts['all'] !== undefined) {
                    //
                } else {
                    if (item.traffic_source.ts[_self.properties.traffic_source] !== undefined) {
                        if (plerdy_refferer && _self.properties.traffic_source === "referral") {
                            var url = document.createElement('a');
                            url.href = plerdy_refferer;
                            for (var ii = 0, length = item.traffic_source.original_ts.length; ii < length; ii++) {
                                url2 = '';
                                if (item.traffic_source.original_ts[ii].referral) {
                                    var url2 = document.createElement('a');
                                    url2.href = item.traffic_source.original_ts[ii].referral;
                                    if (url2.hostname != url.hostname) {
                                        resultTraffikBed = resultTraffikBed * 1;
                                    } else {
                                        resultTraffikBed = resultTraffikBed * 0;
                                    }
                                }
                            }
                            if (resultTraffikBed) {
                                continue
                            }
                        }
                    } else {
                        continue;
                    }
                }
                if (window.country_code_plerdy) {
                    if (item.countries && item.countries.length * 1 > 0) {
                        if (item.countries[0] !== "all" && inArray(window.country_code_plerdy, item.countries) * 1 == -1) {
                            continue;
                        }
                    }
                }
                if (window.plerdy_send_user_group) {
                    if (item.form.trigger_id * 1) {
                        if (item.form.trigger_id + "" !== window.plerdy_send_user_group + "") {
                            continue;
                        }
                    }
                }
                if (item.form.user_behavior && item.form.user_behavior * 1 > 0) {
                    if (item.form.user_behavior * 1 === 1) {
                        if (plerdy_config.first_visit && plerdy_config.first_visit * 1 === 1) {
                            //if(getCookiePlerdy('plerdy_first_visit') && getCookiePlerdy('plerdy_first_visit')*1 === 1){
                            //ok
                        } else {
                            continue;
                        }
                    }
                    if (item.form.user_behavior * 1 === 2) {
                        if (plerdy_config.first_visit * 1 === 0) {
                            //if(getCookiePlerdy('plerdy_first_visit')*1 === 0){
                            //ok
                        } else {
                            continue;
                        }
                    }

                }
                if (item.form.on_off_calendar_show * 1 === 1 && item.tarif.calender_show * 1 === 1) {

                    var show_form_from = item.form.show_form_from.replace(' 00:00:00', '').split('-');
                    show_form_from = show_form_from[0] + "/" + show_form_from[1] + "/" + show_form_from[2];
                    show_form_from = (new Date(show_form_from)).getTime();


                    var show_form_to = item.form.show_form_to.replace(' 00:00:00', '').split('-');
                    show_form_to = show_form_to[0] + "/" + show_form_to[1] + "/" + show_form_to[2];
                    show_form_to = (new Date(show_form_to)).getTime();

                    var today = new Date();
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                    var yyyy = today.getFullYear();
                    today = yyyy + '/' + mm + '/' + dd;
                    today = (new Date(today)).getTime();

                    if (show_form_from * 1 > today * 1) {
                        result = false;
                        continue;
                    }
                    if (show_form_to * 1 < today * 1) {
                        result = false;
                        continue;
                    }
                }
                var OSName = 'all';
                var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                try {
                    if (navigator.appVersion.indexOf("Win") != -1) OSName = "win";
                } catch (err) {
                    //
                }
                try {
                    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "macos";
                } catch (err) {
                    //
                }
                try {
                    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "linux";
                } catch (err) {
                    //
                }
                try {
                    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) OSName = "ios";
                } catch (err) {
                    //
                }
                try {
                    if (/android/i.test(userAgent)) OSName = "android";
                } catch (err) {
                    //
                }
                try {
                    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) OSName = "iso";
                } catch (err) {
                    //
                }
                if (item.form.os === 'all') {

                } else {
                    if (OSName !== item.form.os) {
                        result = false;
                        continue;
                    }
                }
                if (item.form.after_wisit_checked * 1 === 1) {
                    if (item.form.wisit * 1 === 1) {
                        //
                    } else {
                        wisit = _self.getCookieLocal('plerdy_url_visit');
                        if (!wisit) {
                            wisit = 1;
                        } else {
                            wisit = wisit * 1 + 1;
                        }
                        _self.setCookieLocal('plerdy_url_visit', wisit, 0, 30 * 60);
                        if (wisit * 1 !== item.form.wisit * 1) {
                            result = false;
                            continue;
                        }
                    }
                }
                if (item.form.show_always * 1 === 1) {
                    /// ігноруємо
                } else {
                    if (cooki.indexOf(item.form.id + '') * 1 > -1) {
                        result = false;
                        continue;
                    }
                }
                var result2 = checkUrlforBannersAkcia(item.banArciaUrls)
                if (result2) {
                    result = false
                    continue;
                }

                var ipsRules = checkIprules(item.form, object.properties.ip_visitor)
                if (ipsRules === false) {
                    result = false
                    continue;
                }
                /*----form_url_rules----*/
                if (Object.keys(item.urlRules).length * 1 > 0) {
                    var form_url_rules_check = item.urlRules;
                    var isUrlRules = true;
                } else {
                    var form_url_rules_check = [];
                    var isUrlRules = false;
                }
                var isGadgetRules = checkDevice(item.form, item.form_gadget, object.properties.device, 0, 1);

                var device_loc = checkDevice(item.form, item.form_gadget, object.properties.device, 0, 0);
                if (isUrlRules === true) {
                    var rules = checkUrl(form_url_rules_check, item.form.basic_form);
                    if (rules === false) {
                        result = false;
                        continue;
                    }
                }
                if (isGadgetRules === true) {
                    if (device_loc === false) {
                        result = false;
                        continue;
                    }
                }
                if (item.form.label_button_on_off * 1 === 1 && NewformEntity.length * 1 === 0) {
                    NewformEntity.push(item.form);
                    continue;
                }
                if (item.form.label_button_on_off * 1 === 0 && NewformEntity.length * 1 === 0) {
                    NewformEntity.push(item.form);
                    result = true;
                    continue;
                }
                if (NewformEntity.length * 1 === 1 && item.form.label_button_on_off * 1 === 0) {
                    NewformEntity.push(item.form);
                }
                if (NewformEntity.length * 1 >= 2) {
                    result = true;
                }
            }


            if (NewformEntity.length * 1 === 0) {
                return {'ip': object.properties.ip_visitor, 'time': '', 'form_params': {}};
            }
            if (NewformEntity.length * 1 > 0) {
                result = true;
            }
            if (result === false) {
                return {'ip': object.properties.ip_visitor, 'time': '', 'form_params': {}};
            }
            var retAtr = [];
            for (var i = 0; i < NewformEntity.length; i++) {
                if (NewformEntity[i].type_template === 0 || NewformEntity[i].type_template * 1 === -1) {
                    _self.savedatatoStatistica(NewformEntity[i]);
                    if (NewformEntity[i].time * 1 === 0) {
                        var tt = 0.001;
                    } else {
                        var tt = NewformEntity[i].time;
                    }
                    if (plerdy_form_data_params[NewformEntity[i].id].tarif.type_show * 1 === 0) {
                        NewformEntity[i].type_show = 0;
                    }
                    retAtr.push({
                        'ip': object.properties.ip_visitor,
                        'time': tt,
                        'form_params': NewformEntity[i],
                        'titles': ''
                    });
                } else {
                    _self.savedatatoStatistica(NewformEntity[i]);
                    if (NewformEntity[i].time * 1 === 0) {
                        var tt = 0.001;
                    } else {
                        var tt = NewformEntity[i].time;
                    }
                    if (plerdy_form_data_params[NewformEntity[i].id].tarif.type_show * 1 === 0) {
                        NewformEntity[i].type_show = 0;
                    }
                    retAtr.push({
                        'ip': object.properties.ip_visitor,
                        'time': tt,
                        'form_params': NewformEntity[i],
                        'titles': ''
                    });
                }
            }
            return retAtr;
        }
    }

    /**
     * Check if object is empty
     * @param {Object} obj
     * @returns {Boolean}
     */
    this.CheckIfEmptyObject = function (obj) {
        if (Object.keys(obj).length === 0 && obj.constructor === Object) {
            return true;
        } else {
            return false;
        }
    }


    /**
     * create selecotrs from string like A,LI,UL,DIV,DIV,NAV---1,1,1,2,1,3
     * @param {String} string
     * @returns {Mixed}
     */
    this.constructSelector = function (string, id) {
    }

    this.SendGoogleAnalytics = function (send_data, create_date, form_ga_url) {

        if (create_date === undefined) {
            create_date = null;
        }
        if (send_data !== 1) {
            if (send_data * 1 === 0 && ((_self.fe && _self.fe.ga_url_close) || (_self.form_params && _self.form_params.ga_url_close))) {
                try {
                    if (typeof ga === 'function') {
                        var command = '';
                        if (typeof google_tag_manager !== 'undefined') {
                            try {
                                command = ga.getAll()[0].get('name') + '.';
                            } catch (err) {
                            }
                        }
                        command += 'send';
                        try {
                            var VP = false;
                            if (_self.fe && _self.fe.ga_url_close) {
                                var VP = _self.fe.ga_url_close.trim();
                            }
                            if (_self.form_params && _self.form_params.ga_url_close) {
                                var VP = _self.form_params.ga_url_close.trim();
                            }
                            if (VP && (VP + '' !== '0')) {
                                ga(command, 'pageview', VP);
                            }
                        } catch (err) {
                        }
                    }
                } catch (err) {
                }
                /** for GA4 **/
                try {
                    if (dataLayer !== 'undefined') {
                        dataLayer.push({'event': 'Plerdy - Close - ' + _self.form_params.name});
                    }
                } catch (e) {
                    //
                }
                try {
                    gtag('event', "Plerdy - Close - " + _self.form_params.name, {
                        'event_category': "Plerdy - Close - " + _self.form_params.name,
                        'event_label': _self.form_params.name,
                        'value': 1
                    });
                } catch (e) {
                    //
                }
                /** END for GA4 **/
            }
            return;
        }
        var dataS = {};
        dataS.suid = _suid;
        dataS.user_hash = _site_hash_code;
        dataS.form_id = _self.properties.form_id;

        var params = encodeURIComponent(JSON.stringify(dataS, null, 2));
        if (_self.properties.plerdy_url == 'https://test.plerdy.com/click/') {
            var path = plerdy_config.plerdy_url0 + 'get_form_params?params=' + params;
        } else {
            var path = plerdy_config.plerdy_url_live + 'get_form_params?params=' + params;
        }

        _self.sendget(path, 'text/html', function (data) {
            var form = JSON.parse(data);

            if (form.type === undefined)
                return;
            var type = form.type == -1 || form.type == 0 || form.type == 1 || form.type == 3 || form.type == 4;
            if (send_data === 1 && ((_self.fe && _self.fe.ga_url) || (_self.form_params && _self.form_params.ga_url))) {

                var VP = false;
                if (_self.fe && _self.fe.ga_url) {
                    var VP = _self.fe.ga_url.trim();
                }
                if (_self.form_params && _self.form_params.ga_url) {
                    var VP = _self.form_params.ga_url.trim();
                }
                if (VP && (VP + '' !== '0')) {
                    try {
                        function logEvent(category, action, label, value) {
                            if (typeof ga === 'function') {
                                var command = '';
                                var commandPage = '';

                                if (typeof google_tag_manager !== 'undefined') {
                                    try {
                                        command = ga.getAll()[0].get('name') + '.';
                                    } catch (err) {
                                        //console.log('ga.getAll() not defined');
                                    }
                                }
                                command += 'send';

                                if (form_ga_url) {
                                    try {
                                        //console.log('form_ga_url exist')
                                        ga(command, 'pageview', form_ga_url);
                                    } catch (err) {
                                        //console.log('ga() not defined');
                                    }
                                }
                                try {
                                    ga(command, 'event', {
                                        'eventCategory': category,
                                        'eventAction': action,
                                        'eventLabel': label,
                                        'eventValue': typeof value === 'undefined' ? 1 : value
                                    });
                                } catch (err) {
                                    //console.log('ga() not defined');
                                }
                                try {
                                    gtag('event', category, {
                                        'Click': label
                                    });
                                } catch (e) {
                                }
                                try {
                                    gtag('send', 'event', {
                                        'eventCategory': category,
                                        'eventAction': action,
                                        'eventLabel': label,
                                        'eventValue': typeof value === 'undefined' ? 1 : value
                                    });
                                } catch (err) {
                                    //console.log('ga() not defined');
                                }
                            } else {
                                //
                            }
                        }

                        logEvent('Plerdy', _self.properties.page_url, form.name);
                    } catch (err) {
                        //console.log(err);
                    }
                }
                /** for GA4 **/
                try {
                    if (dataLayer !== 'undefined') {
                        dataLayer.push({'event': 'Plerdy - Send - ' + form.name});
                    }
                } catch (e) {
                    //
                }
                try {
                    gtag('event', "Plerdy - Send" + form.name, {
                        'event_category': "Plerdy - Send - " + form.name,
                        'event_label': form.name,
                        'value': 1
                    });
                } catch (e) {
                    //
                }
                /** END for GA4 **/
                try {
                    fbq('track', 'Lead');
                } catch (err) {
                    //
                }
            }
            return;
        });
    };

    _self.Init(optionArr);
}


var object;

(function () {
    object = new init_click_count_plerdy(plerdy_config);
})();

window.addEventListener('blur', function () {
    if (on_off_mode_show * 1 === 1) {

    } else {
        object.sendAllparams('', false);
        object.SendMouseInRegion();
        sendDataScroll(false);
    }
});

window.addEventListener('beforeunload', function (event) {
    if (on_off_mode_show * 1 === 1) {

    } else {
        object.sendAllparams('', false);
        sendDataScroll(false);
        object.SendMouseInRegion();
    }
});
var timeClose = document.getElementById('plerdy_form_for_get_data_close_icon_span')
setTimeout(function () {
    if (timeClose) {
        timeClose.classList.add('time-close');
    }
}, 3000);


function checkUrlforBannersAkcia(urlRules) {
    if (Object.keys(urlRules).length * 1 > 0) {
        for (i = 0; i < urlRules.length; i++) {
            var url = (urlRules[i]).trim();
            current_page = object.properties.page_url.replace(window.location.protocol + '//', '').replace('www.', '');
            if (rtrim(current_page, '/') === rtrim(url, '/')) {
                return true;
            }
        }
    } else {
        return false;
    }
    return false;

}


function checkIprules(formEntity, ip) {
    if (formEntity.custom_ip * 1 === 0) {
        return true
    } else {
        if (formEntity.ip_list) {
            var ipList = unserialize(formEntity.ip_list)
            if (Object.values(ipList).indexOf(ip) * 1 > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}


function unserialize(data) {
    var that = this,
        utf8Overhead = function (chr) {
            // http://phpjs.org/functions/unserialize:571#comment_95906
            var code = chr.charCodeAt(0);
            if (code < 0x0080) {
                return 0;
            }
            if (code < 0x0800) {
                return 1;
            }
            return 2;
        },
        error = function (type, msg, filename, line) {
            throw new window[type](msg, filename, line);
        },
        read_until = function (data, offset, stopchr) {
            var i = 2, buf = [], chr = data.slice(offset, offset + 1);

            while (chr != stopchr) {
                if ((i + offset) > data.length) {
                    error('Error', 'Invalid');
                }
                buf.push(chr);
                chr = data.slice(offset + (i - 1), offset + i);
                i += 1;
            }
            return [buf.length, buf.join('')];
        },
        read_chrs = function (data, offset, length) {
            var i, chr, buf;

            buf = [];
            for (i = 0; i < length; i++) {
                chr = data.slice(offset + (i - 1), offset + i);
                buf.push(chr);
                length -= utf8Overhead(chr);
            }
            return [buf.length, buf.join('')];
        },
        _unserialize = function (data, offset) {
            var dtype, dataoffset, keyandchrs, keys,
                readdata, readData, ccount, stringlength,
                i, key, kprops, kchrs, vprops, vchrs, value,
                chrs = 0,
                typeconvert = function (x) {
                    return x;
                },
                readArray = function () {
                    readdata = {};

                    keyandchrs = read_until(data, dataoffset, ':');
                    chrs = keyandchrs[0];
                    keys = keyandchrs[1];
                    dataoffset += chrs + 2;

                    for (i = 0; i < parseInt(keys, 10); i++) {
                        kprops = _unserialize(data, dataoffset);
                        kchrs = kprops[1];
                        key = kprops[2];
                        dataoffset += kchrs;

                        vprops = _unserialize(data, dataoffset);
                        vchrs = vprops[1];
                        value = vprops[2];
                        dataoffset += vchrs;

                        readdata[key] = value;
                    }
                };

            if (!offset) {
                offset = 0;
            }
            dtype = (data.slice(offset, offset + 1)).toLowerCase();

            dataoffset = offset + 2;

            switch (dtype) {
                case 'i':
                    typeconvert = function (x) {
                        return parseInt(x, 10);
                    };
                    readData = read_until(data, dataoffset, ';');
                    chrs = readData[0];
                    readdata = readData[1];
                    dataoffset += chrs + 1;
                    break;
                case 'b':
                    typeconvert = function (x) {
                        return parseInt(x, 10) !== 0;
                    };
                    readData = read_until(data, dataoffset, ';');
                    chrs = readData[0];
                    readdata = readData[1];
                    dataoffset += chrs + 1;
                    break;
                case 'd':
                    typeconvert = function (x) {
                        return parseFloat(x);
                    };
                    readData = read_until(data, dataoffset, ';');
                    chrs = readData[0];
                    readdata = readData[1];
                    dataoffset += chrs + 1;
                    break;
                case 'n':
                    readdata = null;
                    break;
                case 's':
                    ccount = read_until(data, dataoffset, ':');
                    chrs = ccount[0];
                    stringlength = ccount[1];
                    dataoffset += chrs + 2;

                    readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
                    chrs = readData[0];
                    readdata = readData[1];
                    dataoffset += chrs + 2;
                    if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
                        error('SyntaxError', 'String length mismatch');
                    }
                    break;
                case 'a':
                    readArray();
                    dataoffset += 1;
                    break;
                case 'o':
                    ccount = read_until(data, dataoffset, ':');
                    dataoffset += ccount[0] + 2;

                    ccount = read_until(data, dataoffset, '"');
                    dataoffset += ccount[0] + 2;

                    readArray();
                    dataoffset += 1;
                    break;
                default:
                    error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
                    break;
            }
            return [dtype, dataoffset - offset, typeconvert(readdata)];
        }
    ;

    return _unserialize((data + ''), 0)[2];
}

function checkUrlForHide(form_url_rules, basic_form) {
    var r = 0;
    for (i in form_url_rules) {
        var rule = form_url_rules[i];
        if (rule.on_off * 1 === 0) {
            continue;
        }
//        if (rule.show_hide * 1 === 0) {
//            continue;
//        }
        var r = 1;
        object.properties.page_url = getPlerdy_PageUrl();
        var current_page = object.properties.page_url.replace(window.location.protocol + '//', '');

        if (rule.rule_type * 1 === 1) {
            ruleN = rtrim(rule.rule.replace('http://', '').replace('https://', ''), '/');
            if (rule.show_hide * 1 === 0) {
                if (ruleN != current_page) {
                    return true;
                }
            } else {
                if (ruleN == current_page) {
                    return true;
                }
            }
        } else if (rule.rule_type * 1 === 2) {
            ruleN = rtrim(rule.rule.replace('http://', '').replace('https://', ''), '/');
            if (rule.show_hide * 1 === 0) {
                if (current_page.indexOf(ruleN) * 1 === -1) {
                    return true;
                }
            } else {
                if (current_page.indexOf(ruleN) > -1) {
                    return true;
                }
            }
        } else if (rule.rule_type * 1 === 3) {
            var string = rule.rule;
            if (rule.show_hide * 1 === 0) {
                if (object.properties.page_title.indexOf(string) * 1 === -1) {
                    return true;
                }
            } else {
                if (object.properties.page_title.indexOf(string) > -1) {
                    return true;
                }
            }
        } else if (rule.rule_type * 1 === 4) {
            var string = rule.rule;
            var name = string.split('--!--')[0];
            var value = string.split('--!--')[1];
            cookieLang = object.getCookieLocal('' + name + '');
            if (rule.show_hide * 1 === 0) {
                if (cookieLang != value) {
                    return true;
                }
            } else {
                if (cookieLang == value) {
                    return true;
                }
            }
        } else if (rule.rule_type * 1 === 5 || rule.rule_type * 1 === 6) {
            if (!rule.rule || rule.rule === '') {
                continue;
            } else {
                arr = rule.rule.split('--!--');
                spec_string = arr[0];
                spec_text = arr[1];
                try {
                    element_check = document.querySelector(spec_string);
                    if (element_check) {
                        text_for_check = element_check.innerText.trim();
                        if (rule.show_hide * 1 === 0) {
                            if (text_for_check.toLowerCase() == spec_text.toLowerCase()) {
                                return false;
                            } else {
                                return true;
                            }
                        } else {
                            if (text_for_check.toLowerCase() == spec_text.toLowerCase()) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        return true;
                    }
                } catch (err) {
                    continue;
                }
            }
        }
    }
    return true;
}

function checkUrl(form_url_rules, basic_form) {
    var r = 0;
    rule_has_show = false;
    for (var i = 0; i < form_url_rules.length; i++) {
        if (rule_has_show) {
            continue;
        }
        var rule = form_url_rules[i];
        if (rule.on_off * 1 === 0) {
            continue;
        }
        if (rule.show_hide * 1 === 1) {
            rule_has_show = true;
        }
        r = 1;
    }
    if (!r) {
        return true;
    }
    object.properties.page_url = getPlerdy_PageUrl();
    var current_page = object.properties.page_url.replace(window.location.protocol + '//', '');
    var current_page1 = current_page + '/';
    var current_page_2 = current_page.replace('?', '/?');

    show_form = false;

    for (var i = 0; i < form_url_rules.length; i++) {
        if (show_form) {
            continue;
        }
        var rule = form_url_rules[i];
        if (rule.on_off * 1 === 0) {
            continue;
        }
        if (rule.rule_type * 1 === 1) {
            ruleN = rtrim(rule.rule.replace('http://', '').replace('https://', ''), '/');
            ruleN1 = rtrim(rule.rule.replace('http://', '').replace('https://', ''), '/') + '/';
            if (rule.show_hide * 1 === 1) {
                if (ruleN == current_page || ruleN1 == current_page) {
                    show_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 2) {
            ruleN = rule.rule.replace('http://', '').replace('https://', '');
            if (rule.show_hide * 1 === 1) {
                if (current_page1.indexOf(ruleN) > -1 || current_page_2.indexOf(ruleN) > -1) {
                    show_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 3) {
            var string = rule.rule;
            string = string.toLowerCase();
            var pTitle = object.properties.page_title.toLowerCase();
            if (rule.show_hide * 1 === 1) {
                if (pTitle.indexOf(string) > -1) {
                    show_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 4) {
            var string = rule.rule;
            var name = string.split('--!--')[0];
            var value = string.split('--!--')[1];
            cookieLang = object.getCookie('' + name + '');
            if (rule.show_hide * 1 === 1) {
                if (cookieLang == value) {
                    show_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 5 || rule.rule_type * 1 === 6) {
            if (!rule.rule || rule.rule === '') {
                continue;
            } else {
                arr = rule.rule.split('--!--');
                spec_string = arr[0];
                spec_text = arr[1];
                try {
                    element_check = document.querySelector(spec_string);
                    if (element_check) {
                        text_for_check = element_check.innerText.trim();
                        if (rule.show_hide * 1 === 1) {
                            if (text_for_check.toLowerCase() == spec_text.toLowerCase() ||
                                text_for_check.toLowerCase().indexOf(spec_text.toLowerCase()) > -1 ||
                                spec_text.toLowerCase().indexOf(text_for_check.toLowerCase()) > -1
                            ) {
                                show_form = true;
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                } catch (err) {
                    continue;
                }
            }
        }
    }

    hide_form = false;

    for (var i = 0; i < form_url_rules.length; i++) {
        var rule = form_url_rules[i];
        if (rule.on_off * 1 === 0) {
            continue;
        }
        if (rule.rule_type * 1 === 1) {
            ruleN = rtrim(rule.rule.replace('http://', '').replace('https://', ''), '/');
            ruleN1 = rtrim(rule.rule.replace('http://', '').replace('https://', ''), '/') + '/';
            if (rule.show_hide * 1 === 0) {
                if (ruleN == current_page || ruleN1 == current_page) {
                    hide_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 2) {
            ruleN = rule.rule.replace('http://', '').replace('https://', '');
            if (rule.show_hide * 1 === 0) {
                if (current_page1.indexOf(ruleN) > -1 || current_page_2.indexOf(ruleN) > -1) {
                    hide_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 3) {
            var string = rule.rule;
            string = string.toLowerCase();
            var pTitle = object.properties.page_title.toLowerCase();

            if (rule.show_hide * 1 === 0) {
                if (pTitle.indexOf(string) > -1) {
                    hide_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 4) {
            var string = rule.rule;
            var name = string.split('--!--')[0];
            var value = string.split('--!--')[1];
            cookieLang = object.getCookie('' + name + '');
            if (rule.show_hide * 1 === 0) {
                if (cookieLang == value) {
                    hide_form = true;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if (rule.rule_type * 1 === 5 || rule.rule_type * 1 === 6) {
            if (!rule.rule || rule.rule === '') {
                continue;
            } else {
                arr = rule.rule.split('--!--');
                spec_string = arr[0];
                spec_text = arr[1];
                try {
                    element_check = document.querySelector(spec_string);
                    if (element_check) {
                        text_for_check = element_check.innerText.trim();
                        if (rule.show_hide * 1 === 0) {
                            if (text_for_check.toLowerCase() == spec_text.toLowerCase()) {
                                hide_form = true;
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                } catch (err) {
                    continue;
                }
            }
        }
    }
    if (rule_has_show) {// чи були правила на показ?
        if (show_form) { /// чи показати?
            if (hide_form) { // чи сховати?
                return false; // Були правила на показ і було показати і сховати, тому ховаємо
            } else {
                return true; // Були правила на показ s було показати і НЕ було сховати, тому показуємо
            }
        } else {
            return false; // Були правила на показ і не було показати, тому ховаємо
        }
    } else {  // НЕ Були правила на показ
        if (hide_form) { // чи сховати
            return false; // НЕ Були правила на показ і було НЕ показати, тому ховаємо
        } else {
            return true; // // НЕ Були правила на показ і НЕ було НЕ показати, тому показуємо -- типу дефал
        }
    }
}

function rtrim(str, charlist) {
    charlist = !charlist ? ' \s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    var re = new RegExp('[' + charlist + ']+$', 'g');
    return str.replace(re, '');
}

function checkDevice(form, form_gadget, device, basicForm, is) {
    if (device == 'desktop') {
        device = 2;
    }
    if (device == 'tablet') {
        device = 3;
    }
    if (device == 'mobile') {
        device = 4;
    }
    if (is * 1 === 1) {
        if (form_gadget.length > 0) {
            return true;
        } else {
            return false;
        }
    } else {
        if (form_gadget.length > 0) {
            var form_id = form.id;
            for (var i = 0; i < form_gadget.length; i++) {
                if (form_gadget[i].form_id == form_id && (form_gadget[i].gadget_id * 1 === device * 1 || form_gadget[i].gadget_id * 1 === 1)) {
                    return true;
                }
            }
            return false;
        } else {
            if (basicForm * 1 === 1) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function fullPath(el) {
    var names = [];
    while (el.parentNode && el.parentNode != 'BODY') {
        if (el == el.ownerDocument.documentElement)
            names.unshift(el.tagName);
        else {
            for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++)
                ;
            if (el.tagName === 'BODY') {
                names.unshift(el.tagName);
            } else {
                names.unshift(el.tagName + ":nth-child(" + c + ")");
            }
        }
        el = el.parentNode;
    }
    return names.join(" > ").replace('HTML > ', '');
}

function sendDataForInitPlerdy(change_url) {
    if (change_url === undefined) {
        change_url = '';
    }
    var dataObj = {};
    dataObj.type = 'resize';
    var device = 'desktop';
    if (mobileAndTabletcheck()) {
        device = 'tablet';
    }
    if (mobilecheck()) {
        device = 'mobile';
    }
    if (object.properties.device === device) {
        if (change_url === 'url') {
            dataObj.device = device;
            object.properties.device = device;
            object.processHide();
            object.processHideScroll();
            object.prossesHideMouseInRegions();
            sendToIframe(dataObj);
        }
    } else {
        dataObj.device = device;
        object.properties.device = device;
        object.processHide();
        object.processHideScroll();
        object.prossesHideMouseInRegions();
        sendToIframe(dataObj);
    }
}

function setFormIframeStyles(data, iframeName) {
    if (iframeName === undefined) {
        iframeName = '';
    }
    if (iframeName) {
        var iframe = document.querySelector('body > iframe.plerdy-modal__popup_label_button');
    } else {
        var iframe = document.querySelector('body > iframe.plerdy-modal__popup');
    }
    if (iframe) {
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i += 1) {
            iframe.style[keys[i]] = data[keys[i]];
        }
    }
}

function loadAddPlerdyScript(name, plerdyIframeData) {

    var addName = document.querySelector("[data-add_name='" + name + "']");
    if (addName) {
        doFunc(plerdyIframeData);
    } else {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.dataset.add_name = name;
        s.src = plerdy_config.plerdy_url0 + 'public/js/click/' + name + '.js?v=' + Math.random();
        try {
            document.body.appendChild(s);
            s.onload = function () {
                doFunc(plerdyIframeData);
            }
        } catch (e) {
            console.log(e);
        }
    }

    function doFunc() {
        if (plerdyIframeData.params && plerdyIframeData.params.scroll && plerdyIframeData.params.scroll === 'ab') {
            var data = {};
            data.type = 'preloader';
            sendToIframe(data);
            return;
        }
        if (plerdyIframeData.function == "clearIntervalPlerdycycleStop") {
            clearIntervalPlerdycycleStop();
        }
        if (plerdyIframeData.function == 'prossesShow') {
            if (plerdyIframeData.params.scroll == 'seo_one_wors') {
                var wordsS = plerdyIframeData.seoWords;
                if (wordsS) {
                    wordsS = wordsS.trim().split(",");
                } else {
                    wordsS = [];
                }
                plerdyMakrWords2(wordsS, 'top');
            } else {
                if (plerdyIframeData.params.scroll === "over") {
                    hoverActiveOnOff = 1;
                    plerdyIframeDataHover = plerdyIframeData;
                } else {
                    hoverActiveOnOff = 0;
                    plerdyIframeDataHover = {};
                }
                object.prossesShow(plerdyIframeData, plerdyIframeData.params.scroll);
                try {
                    clearInterval(intervalPlerdycycleStopVar);
                } catch (err) {
                    //
                }
            }
        }
    }
}

function hide_popupPlerdy() {
    var plerdy_modal__popup = document.querySelector('.plerdy-modal__popup');
    if (plerdy_modal__popup) {
        plerdy_modal__popup.parentNode.removeChild(plerdy_modal__popup);
    }
    var modal__popup_id = document.querySelector('#plerdy-modal__popup-overlay_id');
    if (modal__popup_id) {
        modal__popup_id.parentNode.removeChild(modal__popup_id);
    }
};

var plerdyIframeData = '';
var plerdyIframeDataHover = {};
var plerdyReceiveMessage = function (event) {
//    console.log(event);
    var plerdyIframeData = event.data;
    switch (plerdyIframeData.function) {
        case "check_ab_code":
            // console.log(event);
            var data = {};
            data.codeStatus = 'checking';
            if (document.querySelector("[src*='plerdy_ab']")) {
                data.yes_ab = 1;
            } else {
                data.yes_ab = 0;
            }
            // Відправляємо зворотнє повідомлення назад
            event.source.postMessage(data, "*");
            // console.log(event);
            break;
        case "ab_testing":
            try {
                plerdyAbTestingFunc(plerdyIframeData);
            } catch (e) {
                //
            }
            break;
        case "group_over":
            try {
                findElementGroup(plerdyIframeData);
            } catch (e) {
                //
            }
            break;
        case "group_out":
            try {
                findElementGroupOut(plerdyIframeData);
            } catch (e) {
                //
            }
            break;
        case "ClicksStyle":
            if (typeof plerdyClicksStyle !== 'undefined') {
                plerdyClicksStyle(plerdyIframeData.params.style);
            }
            break;
        case "plerdyShowEventsPopup":
            console.log(plerdyIframeData);
            if (plerdyIframeData.params.plerdyShowEventsPopup) {
                plerdyShowEventsPopup = true;
            } else {
                plerdyShowEventsPopup = false;
            }
            break;
        case "hide_popup":
            hide_popupPlerdy();
            break;
        case "hide_embed":
            object.hide_embedform();
            break;
        case "hidecontrol":
            //plerdyShowEventsPopup = true;
            object.hidecontrol();
            break;
        case "open_real_form":
            if (object.form_params && object.fe) {
                var formsCnt = 2;
            } else {
                var formsCnt = 1;
            }
            if (object.form_params) {
                if (object.form_params.id * 1 === plerdyIframeData.id * 1) {
                    var formOb = object.form_params;
                }
            }
            if (object.fe) {
                if (object.fe.id * 1 === plerdyIframeData.id * 1) {
                    var formOb = object.fe;
                }
            }
            var plerdy_modal__popup_overlay_id = document.querySelector('#plerdy-modal__popup-overlay_id');
            if (plerdy_modal__popup_overlay_id) {
                plerdy_modal__popup_overlay_id.parentNode.removeChild(plerdy_modal__popup_overlay_id);

            }
            object.showUserCustomPopupForm(1, formOb, formsCnt);
            break;
        case "sendDatatoServerFromCustomForm":
            if (plerdyIframeData.wheel === undefined) {
                plerdyIframeData.wheel = {};
            }
            if (plerdyIframeData.second === undefined) {
                plerdyIframeData.second = {};
            } else {
                plerdyIframeData.second = plerdyIframeData.second;
            }
            plerdy_config.wheel = plerdyIframeData.wheel;
            object.sendDatatoServerFromCustomForm(plerdyIframeData.form, plerdyIframeData.location_url, plerdyIframeData.target_blank, plerdyIframeData.wheel, plerdyIframeData.second, plerdyIframeData);
            break;
        case "daykyy":
            object.hideCustomForm(3, 1, 0, null, plerdyIframeData.label_button_on_off, plerdyIframeData.id); //текст дякую
            break;
        case "hrest":
            /*hide custom form cooki*/
            object.hideCustomForm(1, 1, 0, null, plerdyIframeData.label_button_on_off, plerdyIframeData.id); // хрестик
            break;
        case "restore":
            object.restore_from_button2();
            break;
        case "aggrt":
            var AAAA = document.createElement('A');
            AAAA.target = plerdyIframeData.target;
            AAAA.href = plerdyIframeData.href;
            AAAA.style.width = "0 px";
            AAAA.style.height = "0 px";
            document.body.appendChild(AAAA);
            AAAA.click();
            document.body.removeChild(AAAA);
            break;
        case "styles":
            setFormIframeStyles(plerdyIframeData.styles, plerdyIframeData.iframeName);
            break;
        case "clearIntervalPlerdycycleStop":
            loadAddPlerdyScript('for_panel', plerdyIframeData);
            break;
        case "prossesShow":
            loadAddPlerdyScript('for_panel', plerdyIframeData);
            break;
        case "processHide":
            //plerdyShowEventsPopup = true;
            object.processHide();
            hoverActiveOnOff = 0;
            break;
        case "prossesHideSeo":
            //plerdyShowEventsPopup = true;
            object.prossesHideSeo();
            hoverActiveOnOff = 0;
            break;
        case "processHideScroll":
            //plerdyShowEventsPopup = true;
            object.processHideScroll();
            hoverActiveOnOff = 0;
            break;
        case "prossesHideMouseInRegions":
            //plerdyShowEventsPopup = false;
            object.prossesHideMouseInRegions();
            break;
        case "mouse_move_sc":
            plerdy_sc = 1;
            break;
        case "setEentSetupWatcher":
            object.setEentSetupWatcher(plerdyIframeData.params);
            break;
        case "showHidePanel":
            //plerdyShowEventsPopup = true;
            showHidePanel();
            break;
        case "show_hide_control":
            //plerdyShowEventsPopup = true;
            object.show_hide_control();
            hoverActiveOnOff = 0;
        case "lpt":
            if (plerdyIframeData.lpt && plerdyIframeData.lpt.indexOf('--!-pp-!--') > -1) {
                var login_hash = plerdyIframeData.lpt.split('--!-pp-!--');
                object.show_hide_control();
                object.setCookieLocal('p_email', login_hash[0], 0, 10000 * 60 * 60);
                object.setCookieLocal('p_hash', login_hash[1], 0, 24 * 60 * 60);
                object.show_hide_control();
            }
        default:
    }
}
window.addEventListener("message", plerdyReceiveMessage, false);

window.addEventListener("resize", function () {
    sendDataForInitPlerdy()
});

function plerdyAddMultipleListeners(element, events, handler, useCapture, args) {
    if (!(events instanceof Array)) {
        throw 'addMultipleListeners: ' +
        'please supply an array of eventstrings ' +
        '(like ["click","mouseover"])';
    }
    //create a wrapper to be able to use additional arguments
    var handlerFn = function (e) {
        handler.apply(this, args && args instanceof Array ? args : []);
    }
    for (var i = 0; i < events.length; i += 1) {
        element.addEventListener(events[i], handlerFn, useCapture);
    }
}

if (_suid * 1 === 5894) {
    var plEventsAll = ['click', 'mousedown', 'mouseup', 'focus', 'blur', 'keydown', 'change', 'mouseup', 'dblclick', 'mousemove', 'mouseover',
        'mouseout', 'mousewheel', 'keydown', 'keyup', 'keypress', 'textInput', 'resize', 'scroll', 'zoom', 'focus', 'blur', 'select', 'change', 'submit', 'reset'];
} else {
    var plEventsAll = ['click', 'mousedown', 'mouseup', 'focus', 'blur', 'keydown', 'change', 'mouseup', 'dblclick', 'mousemove', 'mouseover',
        'mouseout', 'mousewheel', 'keydown', 'keyup', 'keypress', 'textInput', 'resize', 'scroll', 'zoom', 'focus', 'blur', 'select', 'change', 'submit', 'reset'];
}
var pageUrl2 = pageUrl;
plerdyAddMultipleListeners(
    window,
    plEventsAll,
    function () {
        if (plerdy_config.seo_do_now) {
            if (plerdy_config.seo_do_now === 1) {
                seo_do_now = 1;
                seoTimeOut = 2000;
            } else {
                seo_do_now = 0;
            }
        } else {
            seo_do_now = 0;
        }
        //pageUrl = getPlerdy_PageUrl(true);
        if (plerdyTypeTrack === 1) {
            //
        } else {
            if (getPlerdy_PageUrl(false) != pageUrl2 && seo_do_now * 1 === 0) {
                if (on_off_mode_show * 1 === 1) {
                    ////
                } else {
                    startSessionInPageTime = new Date();
                    object.sendAllparams('', false);
                    sendDataScroll(false);
                    object.SendMouseInRegion();
                    modal__popup = document.querySelector('.plerdy-modal__popup');
                    if (modal__popup) {
                        modal__popup.parentNode.removeChild(modal__popup);
                        PlerdyFormIsShowed = 0;
                        PlerdyFormIsShowed_2 = 0;
                    }
                    modal__popup_overlay = document.querySelector('.plerdy-modal__popup-overlay');
                    if (modal__popup_overlay) {
                        modal__popup_overlay.parentNode.removeChild(modal__popup_overlay);
                    }
                    plerdy_modal__popup_label_button = document.querySelector('.plerdy-modal__popup_label_button');
                    if (plerdy_modal__popup_label_button) {
                        PlerdyFormIsShowed = 0;
                        PlerdyFormIsShowedButtonLabel = 0;
                        PlerdyFormIsShowed_2 = 0;
                        PlerdyFormIsShowedButtonLabel_2 = 0;
                        plerdy_modal__popup_label_button.parentNode.removeChild(plerdy_modal__popup_label_button);
                    }
                    var plerdy_page_recorder = document.querySelector("[data-p_vid='p_vid']");
                    if (plerdy_page_recorder) {
                        plerdy_page_recorder.parentNode.removeChild(plerdy_page_recorder);
                        rrwebRecord = "";
                        stopSaveAndLeave();
                    }
                }
                if (on_off_mode_show * 1 === 1) {

                } else {
                    object.sendAllparams('');
                    sendDataScroll();
                    object.SendMouseInRegion();
                }
                pageUrl = getPlerdy_PageUrl(false); // false
                pageUrl2 = pageUrl;
                plerdy_do_now = 1;

                var plerdySourseBuster = false;
                plerdySourseBuster = new plerdySourseBusterFunc(sendSatistic_Before);
                // sbjs.init({
                //     plerdy:plerdy_referrals,
                //     callback: sendSatistic_Before
                // });
                sendDataForInitPlerdy('url');
            }
            ;
        }
    },
    false);

function addPlerdyEvent1(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    } else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}

addPlerdyEvent1(document, "mouseout", function (e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName == "HTML") {
        object.SendMouseInRegion();
    }
});

function on_plerdy(elSelector, eventName, selector, fn) {
    var element = document.querySelector(elSelector);

    element.addEventListener(eventName, function (event) {
        var possibleTargets = element.querySelectorAll(selector);
        var target = event.target;

        for (var i = 0, l = possibleTargets.length; i < l; i++) {
            var el = target;
            var p = possibleTargets[i];

            while (el && el !== element) {
                if (el === p) {
                    return fn.call(p, event);
                }

                el = el.parentNode;
            }
        }
    });
}

function addPlerdyStylesheetTag(path, callback) {
    var link = document.querySelector('#animation_plerdy_tag');
    if (link) {
        if (callback) {
            callback();
        }
    } else {
        link = document.createElement('link');
        var head = document.head || document.getElementsByTagName('head')[0];

        link.rel = "stylesheet";
        link.id = "animation_plerdy_tag";
        link.href = path;
        head.appendChild(link);
        link.onload = function () {
            if (callback) {
                callback();
            }
        }
    }
}

function plerdyCheckElementAppear(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        // Якщо елемент знайдено, викликаємо callback
        callback(element);
    } else {
        // Якщо елемент не знайдено, чекаємо 100 мс і повторюємо перевірку
        setTimeout(() => {
            plerdyCheckElementAppear(selector, callback);
        }, 100);
    }
}

try {
    on_plerdy('body', 'click', '#plerdy_send_form_data_thanks', function (e) {
        let target_blank = document.querySelector('#plerdy_send_form_data_thanks').getAttribute('data-target');
        let location_url = document.querySelector('#plerdy_send_form_data_thanks').getAttribute('data-clickplerdy');
        if (location_url) {
            var AAAA = document.createElement('A');
            AAAA.href = _protocol + location_url;
            if (target_blank && target_blank * 1 == 1) {
                AAAA.target = "_blank";
            }
            AAAA.style.width = "0 px";
            AAAA.style.height = "0 px";
            document.body.appendChild(AAAA);
            AAAA.click();
            document.body.removeChild(AAAA);
            document.querySelector('#plerdy_m_close').click();
        }
    });
} catch (e) {
    console.log(e);
}

function plerdyClearnUrlfunction(url) {
    let ignore_get_params;

    if (url.includes('pobeda')) {
        ignore_get_params = [
            '_ga',
            "_gac",
            "roistat",
            "roistat_referrer",
            "roistat_pos",
            "gclid",
            "spush",
            "goal",
            "cref_id",
            "mref_id",
            "sourse_id",
            "guid",
            "rs",
        ];
    } else {
        ignore_get_params = [
            '_ga',
            "_gac",
            "roistat",
            "roistat_referrer",
            "roistat_pos",
            "utm_source",
            "gclid",
            "utm_medium",
            "utm_content",
            "utm_campaign",
            "utm_term",
            "spush",
            "goal",
            "cref_id",
            "mref_id",
            "sourse_id",
            "guid",
            "utm_adgroup",
            "utm_creative",
            "utm_placement",
            "rs",
        ];
    }

    url = decodeURIComponent(url.trim());
    let urlParts = new URL(url);

    if (urlParts.searchParams) {
        let querys = Object.fromEntries(urlParts.searchParams.entries());

        if (querys && Object.keys(querys).length > 0) {
            for (let p of ignore_get_params) {
                if (querys[p]) {
                    delete querys[p];
                }
            }

            if (Object.keys(querys).length > 0) {
                let querysN = {};

                for (let [key, q] of Object.entries(querys)) {
                    if (!Array.isArray(q)) {
                        querysN[decodeURIComponent(key)] = decodeURIComponent(q);
                    }
                }

                urlParts.search = new URLSearchParams(querysN).toString();
            } else {
                urlParts.search = '';
            }
        }
    }

    if (urlParts.host) {
        urlParts.host = urlParts.host.replace('www.', '').replace('ww3.', '').replace('ww2.', '');
        let resultUrl = urlParts.host;

        if (urlParts.pathname) {
            resultUrl += urlParts.pathname;

            if (urlParts.search) {
                resultUrl += '?' + urlParts.search;
            } else {
                resultUrl = resultUrl.replace(/\/+$/, '');
            }
        } else {
            urlParts.pathname = '';
            resultUrl += urlParts.pathname;

            if (urlParts.search) {
                resultUrl += '?' + urlParts.search;
            } else {
                resultUrl = resultUrl.replace(/\/+$/, '');
            }
        }

        return decodeURIComponent(resultUrl);
    } else {
        return '';
    }
}
;var plerdy_active_elements = 1;
var plerdy_inactive_elements = 1;
var position_array = {};
var plerdy_real_elements = [];
var plerdy_sc = 0;
var previous_data = [];

var maxCntVl = 0,
        averageCntVl = 0,
        allCntVl = 0,
        ratioCntVl = 0;
var selectors = [];
var selectors_hovers = [];
var corector = 5;
var allS = [];
var plerdySelectorsArray = [];
var plerdy_path_ref = false;
if (plerdy_refferer && plerdy_refferer.indexOf('plerdy.')>-1 && plerdy_refferer.indexOf('/panel/') > -1) {
    try{
        var url_ref_arr = new URL(plerdy_refferer);
    }
    catch (err) {
        var url_ref_arr = '';
    }
    if(url_ref_arr){
        var plerdy_path_ref = url_ref_arr.pathname;
        if(plerdy_path_ref){
            plerdy_path_ref = url_ref_arr.pathname.replace('/panel/','');
            var segments = plerdy_path_ref.split('/');
            if(segments[0] && segments[0] === 'check_code'){
                plerdy_config.check_code = 1;
            }else{
                plerdy_config.check_code = 0;
            }

            if(segments[0] && segments[0] === 'seo_do_now'){
                plerdy_config.seo_do_now = 1;
                //history.pushState(null, null, parts[0]);
            }else{
                plerdy_config.seo_do_now = 0;
            }
            var dataForshowPanel = {};
            dataForshowPanel.id = _suid;
            dataForshowPanel.dateFrom = (segments[1]) ? segments[1] : '2016-09-01';
            dataForshowPanel.dateTo = (segments[2]) ? segments[2] : '2026-11-30';
            dataForshowPanel.period = (segments[6]) ? segments[6] : 'today';
            dataForshowPanel.hash = (segments[3]) ? segments[3] : '';
            if(dataForshowPanel.hash){
                object.setCookieLocal('p_hash',dataForshowPanel.hash,0,24*60*60);
            }else{
                dataForshowPanel.hash = object.getCookieLocal('p_hash');
            }
            dataForshowPanel.email = (segments[4]) ? segments[4] : '';
            if(dataForshowPanel.email){
                object.setCookieLocal('p_email',dataForshowPanel.email,0,10000*60*60);
            }else{
                dataForshowPanel.email = object.getCookieLocal('p_email');
            }
            dataForshowPanel.device = (segments[5]) ? segments[5] : '';
            //if(dataForshowPanel.device === ''){
                dataForshowPanel.device = 'desktop';
                if (mobileAndTabletcheck()) {
                    dataForshowPanel.device = 'tablet';
                }
                if (mobilecheck()) {
                    dataForshowPanel.device = 'mobile';
                }
            //}
            if(plerdy_config.id_page && plerdy_config.id_page*1 > 0){
                dataForshowPanel.id_page = plerdy_config.id_page;
            }else{
                dataForshowPanel.id_page = object.getCookieLocal('id_page') * 1;
            }
            dataForshowPanel.auto = true;
            dataForshowPanel.type_auto = segments[0];
            if(url_ref_arr.searchParams.get('ab_testing_id')){
                dataForshowPanel.ab_testing_id = url_ref_arr.searchParams.get('ab_testing_id');
            }
            if(segments[0] &&
                    (segments[0] === 'show_click'
                    || segments[0] === 'show_click_final'
                    || segments[0] === 'show_scroll' || segments[0] === 'show_v'
                    ||  segments[0] === 'mouse_over' || segments[0] === 'scroll_depth'
                    || segments[0] === 'show_mouse_in_regions'
                    || segments[0] === 'show__text_selection'
                    || segments[0] === 'show__seo_words'
                    || segments[0] === 'show_sales'
                    || segments[0] === 'ab')){
                object.preloaderOnPage(10000);
                on_off_mode_show = 1;
                dataForshowPanel.init = 'no_init';
                setTimeout(function(){
                    // console.log(dataForshowPanel);
                    object.showcontrol(parts[0],dataForshowPanel);
                },400);
            }
        }
    }
}



/**
 * create style css and and data attribyte data-pl = "i"
 * @param {String} css
 * @param {String} i
 * @returns
 */
function addStyle_Plerdy(css, i) {
    var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

    style.type = 'text/css';
    if (i) {
        if (document.querySelector("[data-pl='" + i + "']")) {
            head.removeChild(document.querySelector("[data-pl='" + i + "']"));
        }
        style.dataset.pl = i;
    }
    style.innerHTML = css;

    head.appendChild(style);
}

/**
 *
 * @param {String} method - POST, GET
 * @param {String} url - url
 * @param {String} callback - name function for callback
 */
function createCORSRequest(method, url, callback) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url, true);
    } else {
        xhr = null;
    }

    xhr.onload = function () {
        if (xhr.status * 1 !== 200) {
            return false;
        } else {
            if (callback) {
                callback(xhr.responseText);
            } else {
                return xhr.responseText;
            }
        }
    };
    xhr.send();
}

/**
 *
 * @param {type} el
 * @returns {Object}
 */
function offset_pl(el, o) {
    var rect = el.getBoundingClientRect();
    /* для прокрутки, треба додавати!!!!*/
    if (!o) {
        scrollLeftO = window.pageXOffset || document.documentElement.scrollLeft;
        scrollTopO = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    } else {
        scrollLeftO = 0;
        scrollTopO = 0;
    }
    return {top: rect.top + scrollTopO, left: rect.left + scrollLeftO}
}

var plerdyCurrencySales = '';


var intervalPlerdycycleStopVar = -11;


var firstTime;
var maxCntSelectorsPlerdy = 0;
var maxCntSelectorsPlerdy_critical = location.host=='27.ua'?500:1500;
var plerdy_mouseSelect = false;
var plerdyTypeShow = false;
var plerdySalasCurrency = 'USD';

var maxCntVlHovers = -1;

var positions;


function selectDevise() {
    if (mobilecheck()) {
        var ele = document.querySelector('#plerdy_device_mobile');
        if (ele) {
            ele.checked = true;
            return false;
        }
    }

    if (mobileAndTabletcheck()) {
        var ele = document.querySelector('#plerdy_device_tablet');
        if (ele) {
            ele.checked = true;
            return false;
        }
    }

    var ele = document.querySelector('#plerdy_device_desktop');
    if (ele) {
        ele.checked = true;

    }
}

window.addEventListener("resize", function () {
    selectDevise();
    var cl = document.querySelector('#click_plerdy-myonoffswitch');
    if (cl && cl.checked) {
        setTimeout(function () {
            cl.checked = true;
        }, 500);
    }
});
window.addEventListener("load", function () {
    selectDevise();
});


var isScrollingPlerdy;

window.addEventListener("scroll", function (e) {
    plerdy_sc = 1;
    var sv = document.querySelector('#click_plerdy-myonoffswitch');
    var svM = document.querySelector('#plerdy-myonoffswitch-over');
    if ((sv && sv.checked) || (svM && svM.checked)) {
        var spiner = document.querySelector('#preloader-plerdy');
        if (spiner) {
            spiner.style.display = 'block';
        }
    }
    // Clear our timeout throughout the scroll
    window.clearTimeout(isScrollingPlerdy);

    // Set a timeout to run after scrolling ends
    isScrollingPlerdy = setTimeout(function () {

        // Run the callback
        var spiner = document.querySelector('#preloader-plerdy');
        if (spiner) {
            spiner.style.display = 'none';
        }
    }, 1000);
});

window.addEventListener("mousemove", function (e) {
    plerdy_sc = 1;
});

function do_kostyl() {
    if (window.location.host === 'teplokram.com.ua') {
        var el = document.querySelector('#search');
        var el2 = document.querySelector('#search > input');
        if (el && el2) {
            el.style.zIndex = 'auto';
        }
    }
}

function checkChildrenForAddDisplay(el) {
    if (window.location.host === 'papigutto.com.ua') {
        return false;
    }
    var nodes = el.childNodes;
    var res = false;
    if (nodes) {
        nodes.forEach(function (rr) {
            if (rr.nodeName.indexOf('#') < 0) {
                var ss = getComputedStyle(rr);
                if (ss) {
                    if (ss.display == 'block') {
                        res = true;
                    }
                }
            }
        });
    }
    return res;
}

function plerdy_elem_over(e) {
    if (e.target) {
        var target = e.target;
        if (target.parentNode) {
            if(plerdyTypeShow && plerdyTypeShow === 'sales'){
                target = target.parentNode;
                target.firstChild.style.minWidth = '35px';
                target.firstChild.style.height = '35px';
                target.firstChild.style.lineHeight = '35px';
                target.firstChild.style.fontSize = '13px';
                target.style.transition = "all 200ms ease-out";
                //target.style.backgroundColor = "rgba(255,0,0,0.5)";
                target.style.border = '1px dashed blue';
            }else{
                target = target.parentNode;
                target.firstChild.style.minWidth = '35px';
                target.firstChild.style.height = '35px';
                target.firstChild.style.lineHeight = '35px';
                target.firstChild.style.fontSize = '13px';
                target.style.border = '1px dashed blue';
            }
        }
    }
}

function plerdy_elem_out(e) {
    if (e.target) {
        var target = e.target;
        if (target.parentNode) {
            if(plerdyTypeShow && plerdyTypeShow === 'sales'){
                target = target.parentNode;
                target.firstChild.style.minWidth = '20px';
                target.firstChild.style.height = '20px';
                target.firstChild.style.lineHeight = '20px';
                target.firstChild.style.fontSize = '11px';
//                target.style.border = 'none';
                target.style.transition = "none";
                target.style.backgroundColor = "transparent";
            }else{
                target = target.parentNode;
                target.firstChild.style.minWidth = '20px';
                target.firstChild.style.height = '20px';
                target.firstChild.style.lineHeight = '20px';
                target.firstChild.style.fontSize = '11px';
                target.style.border = 'none';
            }
        }
    }
}
/**
 *
 * @param {type} elem
 * @param {type} array
 * @returns {Number}
 */
function inArray(elem, array) {
    var i, length;
    for (var i = 0, length = array.length; i < length; i++) {
        if (array[i] === elem) {
            return i;
        }
    }
    return -1;
}

var timerFarBreakCykle = 0;

document.addEventListener('mousemove',function(e){
    var scrollDiv = document.querySelector('#plerdy_first_div_0');
    if(scrollDiv){
        var docHeight = object.getDocHeight();
        if(e.pageY < docHeight/5){
            iS=0;
        }
        if(e.pageY > docHeight/5 && e.pageY < docHeight/5*2){
            iS=1;
        }
        if(e.pageY > docHeight/5*2 && e.pageY < docHeight/5*3){
            iS=2;
        }
        if(e.pageY > docHeight/5*3 && e.pageY < docHeight/5*4){
            iS=3;
        }
        if(e.pageY > docHeight/5*4 && e.pageY < docHeight){
            iS=4;
        }
        var scrollDiv2All = document.querySelectorAll('.plerdy_div_for_scroll_hover');
        if(scrollDiv2All && scrollDiv2All.length*1 > 0){
            scrollDiv2All.forEach(function (rr) {
                rr.style.border = '1px dashed gray';
            });
        }

        var scrollDiv2 = document.querySelector('#plerdy_first_div_'+iS);
        if(scrollDiv2){
            scrollDiv2.style.border = '2px dashed blue';
        }
    }
    var scrollDivDepth = document.querySelector('#plerdy_first_div_depth_0');
    if(scrollDivDepth){
        var docHeight = object.getDocHeight();
        if(e.pageY < docHeight/10){
            iSd=0;
        }
        if(e.pageY > docHeight/10 && e.pageY < docHeight/10*2){
            iSd=1;
        }
        if(e.pageY > docHeight/10*2 && e.pageY < docHeight/10*3){
            iSd=2;
        }
        if(e.pageY > docHeight/10*3 && e.pageY < docHeight/10*4){
            iSd=3;
        }
        if(e.pageY > docHeight/10*4 && e.pageY < docHeight/10*5){
            iSd=4;
        }
        if(e.pageY > docHeight/10*5 && e.pageY < docHeight/10*6){
            iSd=5;
        }
        if(e.pageY > docHeight/10*6 && e.pageY < docHeight/10*7){
            iSd=6;
        }
        if(e.pageY > docHeight/10*7 && e.pageY < docHeight/10*8){
            iSd=7;
        }
        if(e.pageY > docHeight/10*5 && e.pageY < docHeight/10*9){
            iSd=8;
        }
        if(e.pageY > docHeight/10*9){
            iSd=9;
        }
        var scrollDivDepth2All = document.querySelectorAll('.plerdy_div_for_scroll_depth_hover');
        if(scrollDivDepth2All && scrollDivDepth2All.length*1 > 0){
            scrollDivDepth2All.forEach(function (rr) {
                rr.style.border = '1px dashed gray';
            });
        }
        var scrollDivDepth2 = document.querySelector('#plerdy_first_div_depth_'+iSd);
        if(scrollDivDepth2){
            scrollDivDepth2.style.border = '2px dashed blue';
        }
    }
});
document.addEventListener('mouseover', function (e) {
    if (on_off_mode_show * 1 === 0) {
//            return false;
    }else{
        if(plerdyShowEventsPopup){
            doWhenMouseOver(e);
        }
    }
});

function doWhenMouseOver(e){
    var clickk = "click";
    var clickss = "clicks";
    var other_clicks = "Other clicks";

    if (e.target ) {
        var target = e.target;
        if(target.id && target.id === 'plerdy_control_wraper_id'){
            plerdy_sc = 1;
            return false;
        }
        if(target.hasAttribute("data-plerdy_unical_seo_cnt")){
            showMarkedSeoNum(target,e);
            return false;
        }
        if (!target.hasAttribute("data-plerdynum")) {
            return false;
        }
        if (target.hasAttribute('required')) {
            target.removeAttribute('required');
            target.setAttribute('required1', 'true');
        }

        if (target.dataset && target.dataset.plerdynum) {
            if(target.dataset.closed && target.dataset.plerdyclosed+"" === "1"){
                return false;
            }
            // var dn = document.querySelector("[data-plerdyclosed='1']");
            // if(dn){
            //     dn.dataset.plerdyclosed = 0;
            // }
            var num = target.dataset.plerdynum;            
            var el = document.querySelector('.plerdy_active_z' + num) || document.querySelector('.plerdy_active_z_f' + num);
            if(!el){
                var el = e.textData;
            }
            // console.log(num, el);
            if (el) {
                if(plerdyTypeShow && plerdyTypeShow === 'sales'){
                    if(window.el2) {
                        window.el2.firstChild.style.minWidth = '20px';
                        window.el2.firstChild.style.height = '20px';
                        window.el2.firstChild.style.lineHeight = '20px';
                        window.el2.firstChild.style.fontSize = '11px';
                        window.el2.style.border = 'none';
                        window.el2.style.transition = "none";
                        window.el2.style.backgroundColor = "transparent";
                    }


                    el.firstChild.style.minWidth = '35px';
                    el.firstChild.style.height = '35px';
                    el.firstChild.style.lineHeight = '35px';
                    el.firstChild.style.fontSize = '13px';
                    el.style.transition = "all 200ms ease-out";
                    //el.style.backgroundColor = "rgba(255,0,0,0.5)";
                    el.style.border = '1px dashed blue';
                }else{
                    if(window.el2 && window.el2.firstChild) {
                        window.el2.firstChild.style.minWidth = '20px';
                        window.el2.firstChild.style.height = '20px';
                        window.el2.firstChild.style.lineHeight = '20px';
                        window.el2.firstChild.style.fontSize = '11px';
                        window.el2.style.border = 'none';
                    }

                    if(el.firstChild){
                        el.firstChild.style.minWidth = '35px';
                        el.firstChild.style.height = '35px';
                        el.firstChild.style.lineHeight = '35px';
                        el.firstChild.style.fontSize = '13px';
                        el.style.border = '1px dashed blue';
                    }
                }
                window.el2 = el;
                    var div = document.querySelector('#plerdy_show_on_mouse_hover');
                    if (div) {

                    } else {
                        var div = document.createElement('div');
                    }
                    console.log(e);
                    if(e.XX){
                        var leftP = e.XX * 1;
                    }else{
                        var leftP = e.pageX * 1;
                    }
                    if(document.documentElement.clientWidth - leftP < 190){
                        leftP = (document.documentElement.clientWidth - 190);
                    }
                    if(e.YY){
                        var topP = e.YY * 1 + 10;
                    }else{
                        var topP = e.pageY * 1 + 10;
                    }                    
                    div.setAttribute('style', 'box-sizing: border-box; min-width:177px; max-width:300px; pointer-events:all; text-transform: none; z-index:9999999999; display:block; text-align: left; position: absolute; background: rgba(250, 250, 250, 1); box-shadow: 0px 4px 20px rgb(0 0 0 / 30%); padding: 10px; font: 12px Arial; color: #2B2B2B; border-radius: 8px; left:' + leftP + 'px; top:' + topP + 'px');
                    div.setAttribute('id', 'plerdy_show_on_mouse_hover');
                    div.setAttribute('data-ad_event', '1');
                    if(plerdyTypeShow && plerdyTypeShow === 'sales'){

                    }else{
                        if(plerdyIframeData && plerdyIframeData.params){
                            if (plerdyIframeData.params.scroll === '') {
                                Clicks = 'Clicks';
                                clicks = clickss;
                            }else{
                                Clicks = 'Data';
                                clicks = '';
                            }
                        }else{
                            Clicks = 'Data';
                            clicks = '';
                        }
                    }
                    var text = '<span data-ad_event=\'1\' id="plerdy_hide_popup_info_click" style="pointer-events:all !important; float: right; font-size: 0; height: 12px; width: 20px; cursor: pointer; background-position: center; background-size: 8px; background-image: url(https://a.plerdy.com/public/images/n_close.svg); background-repeat: no-repeat;"> </span>';
                    if (target.tagName === 'SELECT') {
                        var sum = 0
                        var el_childerns = target.childNodes;
                        if (el_childerns) {
                            el_childerns.forEach(function (rr) {
                                if (rr.nodeName === 'OPTION') {
                                    sum = sum + rr.getAttribute('data-i') * 1;
                                }
                            });
                        }
                        if(plerdyTypeShow && plerdyTypeShow === 'sales'){
                            function amFormat2(number){
                                return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits:2 }).format(number)
                            }
                            var moneys = el.firstChild.innerHTML;
                            var num = moneys.split(' ')[0];
                            var curr = moneys.split(' ')[1];
                            var orderIds = el.getAttribute('data-plerdyOrders');
                            var formattedOrderIds = orderIds.replace(/,/g, ', ');
                            text = text + "<ul style='padding: 7px; list-style:none; color: #001E41; font: 12px Arial; margin: 0px; background: #E5E5E5; border-radius: 4px; margin: 8px 0;'><style>li::before{display:none}</style>";
                            text = text + '<li style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Revenue: ' + moneys + '</li>';
                            text = text + '<li style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Quantity: ' + el.getAttribute('data-plerdyquantity') + '</li>';
                            text = text + '<li style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Average Order Value: ' + amFormat2((Math.round((100 * (num.replaceAll(',','')) / el.getAttribute('data-plerdyquantity')*1))/100)) + " "  + curr +  '</li>';
                            text = text + '<li style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Order ID: ' + formattedOrderIds +  '</li>';
                            text = text +'</ul>';
                        }else{
                            text = text + "<span style='font: 700 12px Arial; padding: 6px 0 6px 30px; background-position: left center; background-size: 25px; background-image: url(https://test.plerdy.com//public/images/in_panel.svg); background-repeat: no-repeat; display: inline-block;'>Tag: &lt;" + target.tagName + "&gt </span> <br><ul style='padding: 7px; list-style:none; color: #001E41; font: 12px Arial; margin: 0px; background: #E5E5E5; border-radius: 4px; margin: 8px 0;'><style>li::before{display:none}</style>";
                            text = text + '<li style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">' + Clicks + ' by element: ' + el.firstChild.innerHTML + '</li>';
                            text = text + '<li style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Percent of all ' + clicks + ': ' + Math.round(el.firstChild.innerHTML / allCntVl * 100 * 100) / 100 + "%</li> <li> all &lt;OPTIONS&gt:" + sum + ' ' + clicks + '</li></ul>';
                            if (selectors[num] && selectors[num].US) {
                                text = text + 'Unique session clicks: ' + selectors[num].US + ' <br>';
                            }
                        }
                    } else {
                        if(plerdyTypeShow && plerdyTypeShow === 'sales'){
                            function amFormat2(number){
                                return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits:2 }).format(number)
                            }
                            var moneys = el.firstChild.innerHTML;
                            var num = moneys.split(' ')[0];
                            var curr = moneys.split(' ')[1];
                            var orderIds = el.getAttribute('data-plerdyOrders');
                            var formattedOrderIds = orderIds.replace(/,/g, ', ');
                            text = text + "<ul data-ad_event='1' style='padding: 7px; list-style:none; color: #001E41; font: 12px Arial; margin: 0px; background: #E5E5E5; border-radius: 4px; margin: 8px 0;'><style>li::before{display:none}</style>";
                            text = text + '<li data-ad_event=\'1\' style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Revenue: ' + moneys + '</li>';
                            text = text + '<li data-ad_event=\'1\' style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Quantity: ' + el.getAttribute('data-plerdyquantity') + '</li>';
                            text = text + '<li data-ad_event=\'1\' style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Average Order Value: ' + amFormat2((Math.round((100 * (num.replaceAll(',','')) / el.getAttribute('data-plerdyquantity')*1))/100)) + " "  + curr +  '</li>';
                            text = text + '<li data-ad_event=\'1\' style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Order ID: ' + formattedOrderIds +  '</li>';
                            text = text +'</ul>';
                        }else{
                            let innerText = '';
                            if(el.firstChild){
                                innerText = el.firstChild.innerHTML * 1;
                            }else{
                                innerText = el *1 ;
                            }
                            text = text + "<span style='font: 700 12px Arial; padding: 6px 0 6px 30px; background-position: left center; background-size: 25px; background-image: url(https://test.plerdy.com//public/images/in_panel.svg); background-repeat: no-repeat; display: inline-block;'>Tag: &lt;" + target.tagName + "&gt </span> <br><ul data-ad_event='1' style='padding: 7px; list-style:none; color: #001E41; font: 12px Arial; margin: 0px; background: #E5E5E5; border-radius: 4px; margin: 8px 0;'><style>li::before{display:none}</style>";
                            text = text + '<li data-ad_event=\'1\' style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">' + Clicks + ' by element: ' + innerText + '</li>';
                            text = text + '<li data-ad_event=\'1\' style="padding-left: 0px; margin: 1px 0px; text-transform: none; font: 12px Arial; list-style: none; color: #001E41;">Percent of all ' + clicks + ': ' + Math.round(innerText / allCntVl * 100 * 100) / 100 + "%</li></ul>";
                            if (selectors[num] && selectors[num].US) {
                                text = text + 'Unique session clicks: ' + selectors[num].US + ' <br>';
                            }
                            for (var i = 1; i <= 10; i++) {
                                if (selectors[num] && selectors[num].click_orders && selectors[num].click_orders[i]) {
                                    text = text + 'Clicks №' + i + ': ' + selectors[num].click_orders[i] + " number(s)<br>";
                                }
                            }
                            if (selectors[num] && selectors[num].click_orders && selectors[num].click_orders['other']) {
                                text = text + 'Other clicks' + selectors[num].click_orders['other'] + " number(s)<br>";
                            }
                        }

                    }
                    if(window.Shopify) {
                        text = text + "<br>";
                    }else {
                        text = text + "<br><span data-nummm='" + num + "' data-ad_event='1' style='box-sizing: border-box; cursor: pointer; pointer-events: all; background: #001E41; border-radius: 4px; color: #fff; text-align: center; display: inline-block; padding: 5px; width: 100%;' onclick='addEventCustomInCabinetPlerdy(" + num + ")'>Add event</span>";
                    }
                    div.innerHTML = text;
                    document.querySelector('body').appendChild(div);
                    var ell = document.querySelector('#plerdy_show_on_mouse_hover');
                    if(ell){
                        var st = getComputedStyle(ell);
                        var hh = parseInt(st.height);
                        if(document.documentElement.clientHeight - e.clientY < hh){
                            ell.style.top = ((topP - hh)*1) + 'px';
                        }
                    }

            }
        }
    }
}

document.addEventListener('mouseout', function (e) {

});

function addRemoveHeight(){
    if(_suid+'' === '13589') {
        if (object.properties.device == 'mobile' || object.properties.device == 'tablet') {
            document.querySelector('body').style.height = 'auto';
        }
    }
}

function plerdyClicksStyle(style){

    if(style){
        addStyle_Plerdy('.plerdy_active_z > span { cursor:pointer; box-shadow: 1px 1px 4px 0px rgba(0,0,0,.2); border-radius: 20px; height: 20px; min-width: 20px; text-align: center; line-height: 20px;  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color:#36c6d3; color:#fff; display: block;white-space: nowrap;}', 'p_a_z_s');
        addStyle_Plerdy('.plerdy-gradient_1 {background: linear-gradient(to top right,#18c15e 0%, #18c343 50%);}', 'p_grad_1');
        addStyle_Plerdy('.plerdy-gradient_2 {background: linear-gradient(to top right,#64c765 0%, #65c865 50%);}', 'p_grad_2');
        addStyle_Plerdy('.plerdy-gradient_3 {background: linear-gradient(to top right,#accd72 0%, #b7ce73 50%);}', 'p_grad_3');
        addStyle_Plerdy('.plerdy-gradient_4 {background: linear-gradient(to top right,#d2c664 0%, #d2b765 50%);}', 'p_grad_4');
        addStyle_Plerdy('.plerdy-gradient_5 {background: linear-gradient(to top right,#eeb154 0%, #eea153 50%);}', 'p_grad_5');
        addStyle_Plerdy('.plerdy-gradient_6 {background: linear-gradient(to top right,#ffa24e 0%, #ff794d 50%);}', 'p_grad_6');
        addStyle_Plerdy('.plerdy-gradient_7 {background: linear-gradient(to top right,#ff8f57 0%, #ff8157 50%);}', 'p_grad_7');
        addStyle_Plerdy('.plerdy-gradient_8 {background: linear-gradient(to top right,#fd7a5e 0%, #fd5d5d 50%);}', 'p_grad_8');
        addStyle_Plerdy('.plerdy-gradient_9 {background: linear-gradient(to top right,#f86864 0%, #f86363 50%);}', 'p_grad_9');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_1 {}', 'p_grad_1t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_2 {}', 'p_grad_2t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_3 {}', 'p_grad_3t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_4 {}', 'p_grad_4t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_5 {}', 'p_grad_5t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_6 {}', 'p_grad_6t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_7 {}', 'p_grad_7t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_8 {}', 'p_grad_8t');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_9 {}', 'p_grad_9t');
    }else{
        addStyle_Plerdy('.plerdy_active_z > span {cursor:pointer; border-radius: 0; height: 26px!important; min-width: 26px!important; text-align: center; line-height: 26px!important;  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color:#36c6d3; color:#fff; display: block; background-color: transparent; background-position: center; background-repeat: no-repeat; background-size: contain; box-shadow: none}', 'p_a_z_s');
        addStyle_Plerdy('span.plerdy-gradient_1 {height: 26px!important; min-width: 26px!important; line-height: 26px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_1.svg)}', 'p_grad_1');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_1 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_1t.svg)}', 'p_grad_1t');
        addStyle_Plerdy('span.plerdy-gradient_2 {height: 29px!important; min-width: 29px!important; line-height: 29px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_2.svg)}', 'p_grad_2');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_2 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_2t.svg)}', 'p_grad_2t');
        addStyle_Plerdy('span.plerdy-gradient_3 {height: 32px!important; min-width: 32px!important; line-height: 32px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_3.svg)}', 'p_grad_3');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_3 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_3t.svg)}', 'p_grad_3t');
        addStyle_Plerdy('span.plerdy-gradient_4 {height: 35px!important; min-width: 35px!important; line-height: 35px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_4.svg)}', 'p_grad_4');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_4 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_4t.svg)}', 'p_grad_4t');
        addStyle_Plerdy('span.plerdy-gradient_5 {height: 38px!important; min-width: 38px!important; line-height: 38px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_5.svg)}', 'p_grad_5');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_5 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_5t.svg)}', 'p_grad_5t');
        addStyle_Plerdy('span.plerdy-gradient_6 {height: 41px!important; min-width: 41px!important; line-height: 41px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_6.svg)}', 'p_grad_6');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_6 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_6t.svg)}', 'p_grad_6t');
        addStyle_Plerdy('span.plerdy-gradient_7 {height: 45px!important; min-width: 45px!important; line-height: 45px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_7.svg)}', 'p_grad_7');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_7 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_7t.svg)}', 'p_grad_7t');
        addStyle_Plerdy('span.plerdy-gradient_8 {height: 48px!important; min-width: 48px!important; line-height: 48px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_8.svg)}', 'p_grad_8');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_8 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_8t.svg)}', 'p_grad_8t');
        addStyle_Plerdy('span.plerdy-gradient_9 {height: 51px!important; min-width: 51px!important; line-height: 51px!important; background-image: url(https://test.plerdy.com/public/images/heatmaps/area_9.svg)}', 'p_grad_9');
        addStyle_Plerdy('.plerdy_active_z:nth-child(2n) span.plerdy-gradient_9 {background-image: url(https://test.plerdy.com/public/images/heatmaps/area_9t.svg)}', 'p_grad_9t');
    }
}

function sendToIframe(dataObj) {
    if(document.querySelector("#plerdy_control_wraper_id")){
        document.querySelector("#plerdy_control_wraper_id").contentWindow.postMessage(dataObj, "*");
    }
}

function getClassOrIdPlerdyEvent(elem){
    var clases = elem.className.split(" ").join(",");
    var id = elem.id;
    var res = {};
    if(!clases && !id && elem.parentNode){
        res = getClassOrIdPlerdyEvent(elem.parentNode);
    }else {
        res.id = id;
        res.clases = clases;
    }
    return res;
}
function addEventCustomInCabinetPlerdy(num){
    var elem = document.querySelector('[data-plerdynum="'+num+'"]');
    if(elem) {
        var dataIdClass = getClassOrIdPlerdyEvent(elem);
        //console.log(dataIdClass);
        var id = dataIdClass.id;
        var clases = dataIdClass.clases;

        var url = "";
        if (id) {
            url = MAINPLERDYURL + "admin/custom_tags/" + _suid + "?user_id=" + _suid + "&event_id=" + id;
        }
        if (clases) {
            url = MAINPLERDYURL + "admin/custom_tags/" + _suid + "?user_id=" + _suid + "&event_class=" + clases;
        }
        if (url) {
            var AAAA = document.createElement('A');
            AAAA.href = url;
            AAAA.target = "_blank";
            AAAA.style.width = "0 px";
            AAAA.style.height = "0 px";
            document.body.appendChild(AAAA);
            AAAA.click();
            document.body.removeChild(AAAA);
        }
    }
}
;function showHidePanel() {
    var panel = document.getElementById("plerdy_control-panel");
    if(panel){
        panel.classList.toggle('plerdy_control-panel-hidden');
    }
    var panelPlus = document.getElementById("plerdy_control-btn");
    if(panelPlus){
        panelPlus.classList.toggle('plerdy_plus');
    }
    iframeEl = document.getElementById("plerdy_control_wraper_id");    
    iframeElDiv = document.getElementById("div_plerdy_control_wraper_id");
    
    if(iframeEl){
        if(1*iframeEl.dataset.show ===1){
            iframeEl.style.height = '40px';            
            iframeEl.style.setProperty("width", "50px", "important");
            iframeEl.dataset.show = 0;
            iframeElDiv.style.right = '250px';
            iframeElDiv.style.background = '';  
            iframeElDiv.style.height = '0px';                      
        }else{
            iframeEl.style.height = document.documentElement.clientHeight+'px';                
            iframeEl.dataset.show = 1;
            iframeEl.style.setProperty("width", "260px", "important");                      
            iframeElDiv.style.background = 'url("'+plerdy_config.plerdy_url0+'public/css/panel/move_n.svg") 0% 0% / contain no-repeat';           
            iframeElDiv.style.height = '40px';         
        }
    }  
};

window.addEventListener("change", function (event) {
    var plerdy_dynamic = event.target;
    
    if (plerdy_dynamic.id == 'plerdy_dynamic') {
        if (plerdy_dynamic.checked) {
            timerClick = setInterval(function () {
                getElementsPlerdy();
            }, 1000);            
        } else {
            if (timerClick) {
                clearInterval(timerClick);
                timerClick = 0;                
            }
        }

    }
});
window.addEventListener("load", function(){
    if(window.jQuery){        
        owl = jQuery('.owl-carousel');
         if(owl){
             owl.on('click.owl.carousel', function(event) {                     
                 object.proccesClick(event, object.sendAllparams);
             })
         }        
    }    

    if (window.jQuery && window.jQuery.tag && $.tag) 
    {        
        $.tag.restore('.plerdyinput');
        $.tag.restore('.plerdy_control-panel-inner input');
    }
    else
    {
        //console.log('jQuery.tag немає');
    }
    setTimeout(function () {
        var vTimeClose = document.getElementById('plerdy_form_for_get_data_close_icon_span');
        if(vTimeClose != null){
            vTimeClose.style.display = "block";
        }
    },3000);
    // <style type="text/css">#div_plerdy_control_wraper_id ~ jdiv,#div_plerdy_control_wraper_id ~ [class^="jivo-"]{display: none!important;}</style>
});


;var plerdySourseBusterFunc = function(callback){
    var _self = this;

    this.Init = function(){
        var params = {};
        params.utm_source = '';
        params.utm_medium = '';
        params.utm_campaign = '';
        params.type = '';
        params.referal = '';

        plerdySession.getSession();
        sesNameP = plerdySession.getSesName(); //vid_ses

        // first visit on site
        var plerdy_marker_first_visit = object.getCookieLocal('plerdy_marker_first_visit');
        if(plerdy_marker_first_visit && plerdy_marker_first_visit*1 === 1){
            plerdy_config.first_visit = 0;
            params.first_visit = 0;
        }else{
            plerdy_config.first_visit = 1;
            params.first_visit = 1;
        }
        object.setCookieLocal('plerdy_marker_first_visit', 1, 0, 1000000000);


        var plerdy_marker_30 = object.getCookieLocal('plerdy_marker_30');
        if(plerdy_marker_30 && plerdy_marker_30*1 === 1){
            object.setCookieLocal('plerdy_marker_30', 1, 0, 60*30);

            params.type = object.getCookieLocal('plerdy_ts');
            object.setCookieLocal('plerdy_ts', params.type, 0, 60*30);


            if(params.type === 'utm'){
                params.utm_source = object.getCookieLocal('plerdy_utm_source');
                params.utm_medium = object.getCookieLocal('plerdy_utm_medium');
                params.utm_campaign = object.getCookieLocal('plerdy_utm_campaign');

                object.setCookieLocal('plerdy_referal', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', params.utm_source, 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', params.utm_medium, 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', params.utm_campaign, 0, 60*30);
            }

            if(params.type === "adwords"){
                params.type = "adwords";
                object.setCookieLocal('plerdy_referal', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }

            if(params.type === "social"){
                params.referal = object.getCookieLocal('plerdy_referal');
                object.setCookieLocal('plerdy_referal', params.referal, 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }

            if(params.type === "organic"){
                params.referal = object.getCookieLocal('plerdy_referal');
                object.setCookieLocal('plerdy_referal', params.referal, 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }

            if(params.type === 'referral'){
                params.referal = object.getCookieLocal('plerdy_referal');
                object.setCookieLocal('plerdy_referal', params.referal, 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }

            if(!params.type || params.type === ''){
                params.referal = '';
                object.setCookieLocal('plerdy_referal', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }


        }else{
            object.setCookieLocal('plerdy_marker_30', 1, 0, 60*30);

            //SEARCH UTM
            var getParams = initPlerdyUrlOriginalO.search.substring(1);
            if(getParams &&
                (getParams.indexOf('utm_source')>-1 || getParams.indexOf('utm_medium')>-1 || getParams.indexOf('utm_campaign')>-1)
            ){

                if(getParams.indexOf('&')*1 > -1){
                    getParams.split('&').forEach(function(item1){
                        if(item1 && item1.indexOf('utm_source')*1 > -1 ){
                            params.utm_source = item1.replace('utm_source=','').trim();
                        }
                        if(item1 && item1.indexOf('utm_medium')*1 > -1 ){
                            params.utm_medium = item1.replace('utm_medium=','').trim();
                        }
                        if(item1 && item1.indexOf('utm_campaign')*1 > -1 ){
                            params.utm_campaign = item1.replace('utm_campaign=','').trim();
                        }
                    });
                }else{
                    if(getParams && getParams.indexOf('utm_source')*1 > -1 ){
                        params.utm_source = getParams.replace('utm_source=','').trim();
                    }
                    if(getParams && getParams.indexOf('utm_medium')*1 > -1 ){
                        params.utm_medium = getParams.replace('utm_medium=','').trim();
                    }
                    if(getParams && getParams.indexOf('utm_campaign')*1 > -1 ){
                        params.utm_campaign = getParams.replace('utm_campaign=','').trim();
                    }
                }
                params.type = ' utm';
                object.setCookieLocal('plerdy_utm_source', params.utm_source, 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', params.utm_medium, 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', params.utm_campaign, 0, 60*30);
            }

            //SEARCH ADWORDS
            if(params.type === '' && getParams && getParams.indexOf('gclid=')>-1){
                params.type = "adwords";
                object.setCookieLocal('plerdy_referal', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }


            // Search sosial
            if(params.type === '' && plerdy_refferer){
                params.referal = '';
                var plerdy_sosialArr = ['facebook', 'youtube', 'whatsapp', 'messenger', 'wechat', 'instagram', 'qq', 'tumblr',
                    'qzone', 'tiktok', 'twitter', 'reddit', 'tieba.baidu', 'linkedin', 'viber', 'snapchat',
                    'pinterest', 'line', 'telegram', 'medium', 'vk', 'odnoklassniki', 'quora', 'skype', 'slack'
                ];
                try{
                    var url_ref_arr = new URL(plerdy_refferer);
                }
                catch (err) {
                    var url_ref_arr = '';
                }
                if(url_ref_arr && url_ref_arr.host){
                    plerdy_sosialArr.forEach(function(item1){
                        if(url_ref_arr.host.indexOf(item1+".")*1 > -1){
                            params.type = "social";
                            params.referal = item1;
                        }
                    });
                }
                object.setCookieLocal('plerdy_referal', params.referal, 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }

            // Search organic
            if(params.type === '' && plerdy_refferer){
                params.referal = '';
                var plerdy_organicArr = ['google', 'yandex', 'bing', 'yahoo', 'baidu', 'duckduckgo', 'seznam'];
                try{
                    var url_ref_arr = new URL(plerdy_refferer);
                }catch (err) {
                    var url_ref_arr = '';
                }
                if(url_ref_arr && url_ref_arr.host){
                    plerdy_organicArr.forEach(function(item1){
                        if(url_ref_arr.host.indexOf(item1+'.')*1> -1 ){
                            params.type = 'organic';
                            params.referal = item1;
                        }
                    });
                }
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
                object.setCookieLocal('plerdy_referal', params.referal, 0, 60*30);
            }

            // search referal
            if(params.type === '' && plerdy_refferer){
                try{
                    var url_ref_arr = new URL(plerdy_refferer);
                }
                catch (err) {
                    var url_ref_arr = '';
                }
                if(url_ref_arr && plerdy_refferer.indexOf(location.host)*1==-1){
                    params.type = 'referral';
                    params.referal = url_ref_arr.host;
                }
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
                object.setCookieLocal('plerdy_referal', params.referal, 0, 60*30);
            }
            if(params.type === ''){
                params.type = 'direct';
                params.referal = '';

                object.setCookieLocal('plerdy_referal', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_source', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_medium', '', 0, 60*30);
                object.setCookieLocal('plerdy_utm_campaign', '', 0, 60*30);
            }

            object.setCookieLocal('plerdy_ts', params.type, 0, 60*30);
        }

        // traf_sourse

        if(callback){
            callback(params);
        }
    };

    _self.Init(callback);
};
;var plerdyVisitorId;
var FingerprintJSPlerdy=function(e){"use strict";function t(e,t){e=[e[0]>>>16,65535&e[0],e[1]>>>16,65535&e[1]],t=[t[0]>>>16,65535&t[0],t[1]>>>16,65535&t[1]];var n=[0,0,0,0];return n[3]+=e[3]+t[3],n[2]+=n[3]>>>16,n[3]&=65535,n[2]+=e[2]+t[2],n[1]+=n[2]>>>16,n[2]&=65535,n[1]+=e[1]+t[1],n[0]+=n[1]>>>16,n[1]&=65535,n[0]+=e[0]+t[0],n[0]&=65535,[n[0]<<16|n[1],n[2]<<16|n[3]]}function n(e,t){e=[e[0]>>>16,65535&e[0],e[1]>>>16,65535&e[1]],t=[t[0]>>>16,65535&t[0],t[1]>>>16,65535&t[1]];var n=[0,0,0,0];return n[3]+=e[3]*t[3],n[2]+=n[3]>>>16,n[3]&=65535,n[2]+=e[2]*t[3],n[1]+=n[2]>>>16,n[2]&=65535,n[2]+=e[3]*t[2],n[1]+=n[2]>>>16,n[2]&=65535,n[1]+=e[1]*t[3],n[0]+=n[1]>>>16,n[1]&=65535,n[1]+=e[2]*t[2],n[0]+=n[1]>>>16,n[1]&=65535,n[1]+=e[3]*t[1],n[0]+=n[1]>>>16,n[1]&=65535,n[0]+=e[0]*t[3]+e[1]*t[2]+e[2]*t[1]+e[3]*t[0],n[0]&=65535,[n[0]<<16|n[1],n[2]<<16|n[3]]}function r(e,t){return 32===(t%=64)?[e[1],e[0]]:t<32?[e[0]<<t|e[1]>>>32-t,e[1]<<t|e[0]>>>32-t]:(t-=32,[e[1]<<t|e[0]>>>32-t,e[0]<<t|e[1]>>>32-t])}function a(e,t){return 0===(t%=64)?e:t<32?[e[0]<<t|e[1]>>>32-t,e[1]<<t]:[e[1]<<t-32,0]}function i(e,t){return[e[0]^t[0],e[1]^t[1]]}function o(e){return e=i(e,[0,e[0]>>>1]),e=i(e=n(e,[4283543511,3981806797]),[0,e[0]>>>1]),e=i(e=n(e,[3301882366,444984403]),[0,e[0]>>>1])}function c(e,c){c=c||0;var s,u=(e=e||"").length%16,l=e.length-u,d=[0,c],f=[0,c],h=[0,0],p=[0,0],v=[2277735313,289559509],m=[1291169091,658871167];for(s=0;s<l;s+=16)h=[255&e.charCodeAt(s+4)|(255&e.charCodeAt(s+5))<<8|(255&e.charCodeAt(s+6))<<16|(255&e.charCodeAt(s+7))<<24,255&e.charCodeAt(s)|(255&e.charCodeAt(s+1))<<8|(255&e.charCodeAt(s+2))<<16|(255&e.charCodeAt(s+3))<<24],p=[255&e.charCodeAt(s+12)|(255&e.charCodeAt(s+13))<<8|(255&e.charCodeAt(s+14))<<16|(255&e.charCodeAt(s+15))<<24,255&e.charCodeAt(s+8)|(255&e.charCodeAt(s+9))<<8|(255&e.charCodeAt(s+10))<<16|(255&e.charCodeAt(s+11))<<24],h=r(h=n(h,v),31),d=t(d=r(d=i(d,h=n(h,m)),27),f),d=t(n(d,[0,5]),[0,1390208809]),p=r(p=n(p,m),33),f=t(f=r(f=i(f,p=n(p,v)),31),d),f=t(n(f,[0,5]),[0,944331445]);switch(h=[0,0],p=[0,0],u){case 15:p=i(p,a([0,e.charCodeAt(s+14)],48));case 14:p=i(p,a([0,e.charCodeAt(s+13)],40));case 13:p=i(p,a([0,e.charCodeAt(s+12)],32));case 12:p=i(p,a([0,e.charCodeAt(s+11)],24));case 11:p=i(p,a([0,e.charCodeAt(s+10)],16));case 10:p=i(p,a([0,e.charCodeAt(s+9)],8));case 9:p=n(p=i(p,[0,e.charCodeAt(s+8)]),m),f=i(f,p=n(p=r(p,33),v));case 8:h=i(h,a([0,e.charCodeAt(s+7)],56));case 7:h=i(h,a([0,e.charCodeAt(s+6)],48));case 6:h=i(h,a([0,e.charCodeAt(s+5)],40));case 5:h=i(h,a([0,e.charCodeAt(s+4)],32));case 4:h=i(h,a([0,e.charCodeAt(s+3)],24));case 3:h=i(h,a([0,e.charCodeAt(s+2)],16));case 2:h=i(h,a([0,e.charCodeAt(s+1)],8));case 1:h=n(h=i(h,[0,e.charCodeAt(s)]),v),d=i(d,h=n(h=r(h,31),m))}return d=t(d=i(d,[0,e.length]),f=i(f,[0,e.length])),f=t(f,d),d=t(d=o(d),f=o(f)),f=t(f,d),("00000000"+(d[0]>>>0).toString(16)).slice(-8)+("00000000"+(d[1]>>>0).toString(16)).slice(-8)+("00000000"+(f[0]>>>0).toString(16)).slice(-8)+("00000000"+(f[1]>>>0).toString(16)).slice(-8)}var s=function(){return(s=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var a in t=arguments[n])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e}).apply(this,arguments)};function u(e,t,n,r){return new(n||(n=Promise))((function(a,i){function o(e){try{s(r.next(e))}catch(t){i(t)}}function c(e){try{s(r.throw(e))}catch(t){i(t)}}function s(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,c)}s((r=r.apply(e,t||[])).next())}))}function l(e,t){var n,r,a,i,o={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;o;)try{if(n=1,r&&(a=2&i[0]?r.return:i[0]?r.throw||((a=r.return)&&a.call(r),0):r.next)&&!(a=a.call(r,i[1])).done)return a;switch(r=0,a&&(i=[2&i[0],a.value]),i[0]){case 0:case 1:a=i;break;case 4:return o.label++,{value:i[1],done:!1};case 5:o.label++,r=i[1],i=[0];continue;case 7:i=o.ops.pop(),o.trys.pop();continue;default:if(!(a=o.trys,(a=a.length>0&&a[a.length-1])||6!==i[0]&&2!==i[0])){o=0;continue}if(3===i[0]&&(!a||i[1]>a[0]&&i[1]<a[3])){o.label=i[1];break}if(6===i[0]&&o.label<a[1]){o.label=a[1],a=i;break}if(a&&o.label<a[2]){o.label=a[2],o.ops.push(i);break}a[2]&&o.ops.pop(),o.trys.pop();continue}i=t.call(e,o)}catch(c){i=[6,c],r=0}finally{n=a=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,c])}}}function d(){for(var e=0,t=0,n=arguments.length;t<n;t++)e+=arguments[t].length;var r=Array(e),a=0;for(t=0;t<n;t++)for(var i=arguments[t],o=0,c=i.length;o<c;o++,a++)r[a]=i[o];return r}function f(e,t){return new Promise((function(n){return setTimeout(n,e,t)}))}function h(e,t){void 0===t&&(t=1/0);var n=window.requestIdleCallback;return n?new Promise((function(e){return n((function(){return e()}),{timeout:t})})):f(Math.min(e,t))}function p(e){return parseInt(e)}function v(e){return parseFloat(e)}function m(e,t){return"number"==typeof e&&isNaN(e)?t:e}function g(e){return e.reduce((function(e,t){return e+(t?1:0)}),0)}function b(){var e=window,t=navigator;return g(["MSCSSMatrix"in e,"msSetImmediate"in e,"msIndexedDB"in e,"msMaxTouchPoints"in t,"msPointerEnabled"in t])>=4}function w(){var e=window,t=navigator;return g(["msWriteProfilerMark"in e,"MSStream"in e,"msLaunchUri"in t,"msSaveBlob"in t])>=3&&!b()}function y(){var e=window,t=navigator;return g(["webkitPersistentStorage"in t,"webkitTemporaryStorage"in t,0===t.vendor.indexOf("Google"),"webkitResolveLocalFileSystemURL"in e,"BatteryManager"in e,"webkitMediaStream"in e,"webkitSpeechGrammar"in e])>=5}function k(){var e=window,t=navigator;return g(["ApplePayError"in e,"CSSPrimitiveValue"in e,"Counter"in e,0===t.vendor.indexOf("Apple"),"getStorageUpdates"in t,"WebKitMediaKeys"in e])>=4}function C(){var e=window;return g(["safari"in e,!("DeviceMotionEvent"in e),!("ongestureend"in e),!("standalone"in navigator)])>=3}function A(){var e,t,n=window;return g(["buildID"in navigator,"MozAppearance"in(null!==(t=null===(e=document.documentElement)||void 0===e?void 0:e.style)&&void 0!==t?t:{}),"MediaRecorderErrorEvent"in n,"mozInnerScreenX"in n,"CSSMozDocumentRule"in n,"CanvasCaptureMediaStream"in n])>=4}function S(){var e=document;return e.fullscreenElement||e.msFullscreenElement||e.mozFullScreenElement||e.webkitFullscreenElement||null}function x(e){return new Promise((function(t,n){e.oncomplete=function(e){return t(e.renderedBuffer)};var r=3,a=function(){switch(e.startRendering(),e.state){case"running":setTimeout((function(){return n(_("timeout"))}),1e3);break;case"suspended":document.hidden||r--,r>0?setTimeout(a,500):n(_("suspended"))}};a()}))}function M(e){for(var t=0,n=0;n<e.length;++n)t+=Math.abs(e[n]);return t}function _(e){var t=new Error(e);return t.name=e,t}function P(e,t,n){var r,a;return void 0===n&&(n=50),u(this,void 0,void 0,(function(){var i,o;return l(this,(function(c){switch(c.label){case 0:i=document,c.label=1;case 1:return i.body?[3,3]:[4,f(n)];case 2:return c.sent(),[3,1];case 3:o=i.createElement("iframe"),c.label=4;case 4:return c.trys.push([4,,10,11]),[4,new Promise((function(e,n){o.onload=e,o.onerror=n;var r=o.style;r.setProperty("display","block","important"),r.position="absolute",r.top="0",r.left="0",r.visibility="hidden",i.body.appendChild(o),t&&"srcdoc"in o?o.srcdoc=t:o.src="about:blank"}))];case 5:c.sent(),c.label=6;case 6:return(null===(r=o.contentWindow)||void 0===r?void 0:r.document.body)?[3,8]:[4,f(n)];case 7:return c.sent(),[3,6];case 8:return[4,e(o,o.contentWindow)];case 9:return[2,c.sent()];case 10:return null===(a=o.parentNode)||void 0===a||a.removeChild(o),[7];case 11:return[2]}}))}))}function T(e){for(var t=function(e){for(var t,n,r="Unexpected syntax '"+e+"'",a=/^\s*([a-z-]*)(.*)$/i.exec(e),i=a[1]||void 0,o={},c=/([.:#][\w-]+|\[.+?\])/gi,s=function(e,t){o[e]=o[e]||[],o[e].push(t)};;){var u=c.exec(a[2]);if(!u)break;var l=u[0];switch(l[0]){case".":s("class",l.slice(1));break;case"#":s("id",l.slice(1));break;case"[":var d=/^\[([\w-]+)([~|^$*]?=("(.*?)"|([\w-]+)))?(\s+[is])?\]$/.exec(l);if(!d)throw new Error(r);s(d[1],null!==(n=null!==(t=d[4])&&void 0!==t?t:d[5])&&void 0!==n?n:"");break;default:throw new Error(r)}}return[i,o]}(e),n=t[0],r=t[1],a=document.createElement(null!=n?n:"div"),i=0,o=Object.keys(r);i<o.length;i++){var c=o[i];a.setAttribute(c,r[c].join(" "))}return a}var E=["monospace","sans-serif","serif"],I=["sans-serif-thin","ARNO PRO","Agency FB","Arabic Typesetting","Arial Unicode MS","AvantGarde Bk BT","BankGothic Md BT","Batang","Bitstream Vera Sans Mono","Calibri","Century","Century Gothic","Clarendon","EUROSTILE","Franklin Gothic","Futura Bk BT","Futura Md BT","GOTHAM","Gill Sans","HELV","Haettenschweiler","Helvetica Neue","Humanst521 BT","Leelawadee","Letter Gothic","Levenim MT","Lucida Bright","Lucida Sans","Menlo","MS Mincho","MS Outlook","MS Reference Specialty","MS UI Gothic","MT Extra","MYRIAD PRO","Marlett","Meiryo UI","Microsoft Uighur","Minion Pro","Monotype Corsiva","PMingLiU","Pristina","SCRIPTINA","Segoe UI Light","Serifa","SimHei","Small Fonts","Staccato222 BT","TRAJAN PRO","Univers CE 55 Medium","Vrinda","ZWAdobeF"];function L(e){return e.rect(0,0,10,10),e.rect(2,2,6,6),!e.isPointInPath(5,5,"evenodd")}function z(e,t){e.width=240,e.height=60,t.textBaseline="alphabetic",t.fillStyle="#f60",t.fillRect(100,1,62,20),t.fillStyle="#069",t.font='11pt "Times New Roman"';var n="Cwm fjordbank gly "+String.fromCharCode(55357,56835);return t.fillText(n,2,15),t.fillStyle="rgba(102, 204, 0, 0.2)",t.font="18pt Arial",t.fillText(n,4,45),F(e)}function B(e,t){e.width=122,e.height=110,t.globalCompositeOperation="multiply";for(var n=0,r=[["#f2f",40,40],["#2ff",80,40],["#ff2",60,80]];n<r.length;n++){var a=r[n],i=a[0],o=a[1],c=a[2];t.fillStyle=i,t.beginPath(),t.arc(o,c,40,0,2*Math.PI,!0),t.closePath(),t.fill()}return t.fillStyle="#f9c",t.arc(60,60,60,0,2*Math.PI,!0),t.arc(60,60,20,0,2*Math.PI,!0),t.fill("evenodd"),F(e)}function F(e){return e.toDataURL()}var O,D;function R(){return u(this,void 0,void 0,(function(){var e;return l(this,(function(t){switch(t.label){case 0:return j(e=G())?O?[2,d(O)]:S()?[4,(n=document,(n.exitFullscreen||n.msExitFullscreen||n.mozCancelFullScreen||n.webkitExitFullscreen).call(n))]:[3,2]:[3,2];case 1:t.sent(),e=G(),t.label=2;case 2:return j(e)||(O=e),[2,e]}var n}))}))}function G(){var e=screen;return[m(v(e.availTop),null),m(v(e.width)-v(e.availWidth)-m(v(e.availLeft),0),null),m(v(e.height)-v(e.availHeight)-m(v(e.availTop),0),null),m(v(e.availLeft),null)]}function j(e){for(var t=0;t<4;++t)if(e[t])return!1;return!0}var U={abpIndo:["#Iklan-Melayang","#Kolom-Iklan-728","#SidebarIklan-wrapper",'a[title="7naga poker" i]','[title="ALIENBOLA" i]'],abpvn:["#quangcaomb",".i-said-no-thing-can-stop-me-warning.dark",".quangcao",'[href^="https://r88.vn/"]','[href^="https://zbet.vn/"]'],adBlockFinland:[".mainostila",".sponsorit",".ylamainos",'a[href*="/clickthrgh.asp?"]','a[href^="https://app.readpeak.com/ads"]'],adBlockPersian:["#navbar_notice_50",'a[href^="https://iqoption.com/lp/mobile-partner/?aff="]',".kadr",'TABLE[width="140px"]',"#divAgahi"],adBlockWarningRemoval:["#adblock_message",".adblockInfo",".deadblocker-header-bar",".no-ad-reminder","#AdBlockDialog"],adGuardAnnoyances:['amp-embed[type="zen"]',".hs-sosyal","#cookieconsentdiv",'div[class^="app_gdpr"]',".as-oil"],adGuardBase:["#gads_middle",".tjads",".BetterJsPopOverlay","#ad_300X250","#bannerfloat22"],adGuardChinese:['a[href*=".123ch.cn"]','a[href*=".ttz5.cn"]','a[href*=".yabovip2027.com/"]',".tm3all2h4b","#j-new-ad"],adGuardFrench:["#div_banniere_pub",'a[href^="https://secure.securitetotale.fr/"]','a[href*="fducks.com/"]','a[href^="http://frtyd.com/"]',".publicite1"],adGuardGerman:[".banneritemwerbung_head_1",".boxstartwerbung",".werbung3",'a[href^="http://www.ichwuerde.com/?ref="]','a[href^="http://partners.adklick.de/tracking.php?"]'],adGuardJapanese:[".ad-text-blockA01","._popIn_infinite_video","[class^=blogroll_wrapper]",'a[href^="http://ad2.trafficgate.net/"]','a[href^="http://www.rssad.jp/"]'],adGuardMobile:["amp-auto-ads","#mgid_iframe",".amp_ad","amp-sticky-ad",".plugin-blogroll"],adGuardRussian:['a[href^="https://ya-distrib.ru/r/"]','[onclick*=".twkv.ru"]',".reclama",'div[id^="smi2adblock"]','div[id^="AdFox_banner_"]'],adGuardSocial:['a[href^="//www.stumbleupon.com/submit?url="]','a[href^="//telegram.me/share/url?"]',".etsy-tweet","#inlineShare",".popup-social"],adGuardSpanishPortuguese:["#barraPublicidade","#Publicidade","#publiEspecial","#queTooltip",'[href^="http://ads.glispa.com/"]'],adGuardTrackingProtection:['amp-embed[type="taboola"]',"#qoo-counter",'a[href^="http://click.hotlog.ru/"]','a[href^="http://hitcounter.ru/top/stat.php"]','a[href^="http://top.mail.ru/jump"]'],adGuardTurkish:["#backkapat","#reklami",'a[href^="http://adserv.ontek.com.tr/"]','a[href^="http://izlenzi.com/campaign/"]','a[href^="http://www.installads.net/"]'],bulgarian:["td#freenet_table_ads","#newAd","#ea_intext_div",".lapni-pop-over","#xenium_hot_offers"],easyList:['[lazy-ad="leftthin_banner"]',"#ad_300x250_2","#interstitialAd","#wide_ad_unit",".showcaseAd"],easyListChina:['a[href*=".wensixuetang.com/"]','A[href*="/hth107.com/"]','.appguide-wrap[onclick*="bcebos.com"]',".frontpageAdvM","#taotaole"],easyListCookie:["#CookieEU","#__cookies_","#les_cookies",".asset_balaNotification",".gdpr-tab"],easyListCzechSlovak:["#onlajny-stickers","#reklamni-box",".reklama-megaboard",".sklik",'[id^="sklikReklama"]'],easyListDutch:["#advertentie","#vipAdmarktBannerBlock",".adstekst",'a[href^="http://adserver.webads.nl/adclick/"]',"#semilo-lrectangle"],easyListGermany:["#LxWerbeteaser",'a[href^="http://www.kontakt-vermittler.de/?wm="]',".werbung301",".ads_bueroklammer","#Werbung_Sky"],easyListItaly:[".box_adv_annunci",".sb-box-pubbliredazionale",'a[href^="http://affiliazioniads.snai.it/"]','a[href^="https://adserver.html.it/"]','a[href^="https://affiliazioniads.snai.it/"]'],easyListLithuania:[".reklamos_tarpas",".reklamos_nuorodos",'img[alt="Reklaminis skydelis"]','img[alt="Dedikuoti.lt serveriai"]','img[alt="Hostingas Serveriai.lt"]'],estonian:['A[href*="http://pay4results24.eu"]'],fanboyAnnoyances:["#feedback-tab","#taboola-below-article",".feedburnerFeedBlock",".widget-feedburner-counter",'[title="Subscribe to our blog"]'],fanboyAntiFacebook:[".util-bar-module-firefly-visible"],fanboyEnhancedTrackers:[".open.pushModal","#issuem-leaky-paywall-articles-zero-remaining-nag",'div[style*="box-shadow: rgb(136, 136, 136) 0px 0px 12px; color: "]','div[class$="-hide"][zoompage-fontsize][style="display: block;"]',".BlockNag__Card"],fanboySocial:[".td-tags-and-social-wrapper-box",".twitterContainer",".youtube-social",'a[title^="Like us on Facebook"]','img[alt^="Share on Digg"]'],frellwitSwedish:['a[href*="casinopro.se"][target="_blank"]','a[href*="doktor-se.onelink.me"]',"article.category-samarbete","div.holidAds","ul.adsmodern"],greekAdBlock:['A[href*="adman.otenet.gr/click?"]','A[href*="http://axiabanners.exodus.gr/"]','A[href*="http://interactive.forthnet.gr/click?"]',"DIV.agores300","TABLE.advright"],hungarian:['A[href*="ad.eval.hu"]','A[href*="ad.netmedia.hu"]','A[href*="daserver.ultraweb.hu"]',"#cemp_doboz",".optimonk-iframe-container"],iDontCareAboutCookies:['.alert-info[data-block-track*="CookieNotice"]',".ModuleTemplateCookieIndicator",".o--cookies--container",".cookie-msg-info-container","#cookies-policy-sticky"],icelandicAbp:['A[href^="/framework/resources/forms/ads.aspx"]'],latvian:['a[href="http://www.salidzini.lv/"][style="display: block; width: 120px; height: 40px; overflow: hidden; position: relative;"]','a[href="http://www.salidzini.lv/"][style="display: block; width: 88px; height: 31px; overflow: hidden; position: relative;"]'],listKr:['a[href*="//kingtoon.slnk.kr"]','a[href*="//playdsb.com/kr"]',"div.logly-lift-adz",'div[data-widget_id="ml6EJ074"]',"ins.daum_ddn_area"],listeAr:[".geminiLB1Ad",".right-and-left-sponsers",'a[href*=".aflam.info"]','a[href*="booraq.org"]','a[href*="dubizzle.com/ar/?utm_source="]'],listeFr:['a[href^="http://promo.vador.com/"]',"#adcontainer_recherche",'a[href*="weborama.fr/fcgi-bin/"]',".site-pub-interstitiel",'div[id^="crt-"][data-criteo-id]'],officialPolish:["#ceneo-placeholder-ceneo-12",'[href^="https://aff.sendhub.pl/"]','a[href^="http://advmanager.techfun.pl/redirect/"]','a[href^="http://www.trizer.pl/?utm_source"]',"div#skapiec_ad"],ro:['a[href^="//afftrk.altex.ro/Counter/Click"]','a[href^="/magazin/"]','a[href^="https://blackfridaysales.ro/trk/shop/"]','a[href^="https://event.2performant.com/events/click"]','a[href^="https://l.profitshare.ro/"]'],ruAd:['a[href*="//febrare.ru/"]','a[href*="//utimg.ru/"]','a[href*="://chikidiki.ru"]',"#pgeldiz",".yandex-rtb-block"],thaiAds:["a[href*=macau-uta-popup]","#ads-google-middle_rectangle-group",".ads300s",".bumq",".img-kosana"],webAnnoyancesUltralist:["#mod-social-share-2","#social-tools",".ctpl-fullbanner",".zergnet-recommend",".yt.btn-link.btn-md.btn"]},W=Object.keys(U);function N(e){var t;return u(this,void 0,void 0,(function(){var n,r,a,i,o,c,s,u,d,h;return l(this,(function(l){switch(l.label){case 0:for(n=document,r=n.createElement("div"),a=[],i={},q(r),o=0,c=e;o<c.length;o++)s=c[o],u=T(s),q(d=n.createElement("div")),d.appendChild(u),r.appendChild(d),a.push(u);l.label=1;case 1:return n.body?[3,3]:[4,f(50)];case 2:return l.sent(),[3,1];case 3:n.body.appendChild(r);try{for(h=0;h<e.length;++h)a[h].offsetParent||(i[e[h]]=!0)}finally{null===(t=r.parentNode)||void 0===t||t.removeChild(r)}return[2,i]}}))}))}function q(e){e.style.setProperty("display","block","important")}function H(e){return matchMedia("(inverted-colors: "+e+")").matches}function J(e){return matchMedia("(forced-colors: "+e+")").matches}function V(e){return matchMedia("(prefers-contrast: "+e+")").matches}function K(e){return matchMedia("(prefers-reduced-motion: "+e+")").matches}function $(e){return matchMedia("(dynamic-range: "+e+")").matches}var X=Math,Y=function(){return 0},Z=X.acos||Y,Q=X.acosh||Y,ee=X.asin||Y,te=X.asinh||Y,ne=X.atanh||Y,re=X.atan||Y,ae=X.sin||Y,ie=X.sinh||Y,oe=X.cos||Y,ce=X.cosh||Y,se=X.tan||Y,ue=X.tanh||Y,le=X.exp||Y,de=X.expm1||Y,fe=X.log1p||Y,he=function(e){return X.pow(X.PI,e)},pe=function(e){return X.log(e+X.sqrt(e*e+1))},ve=function(e){return X.log((1+e)/(1-e))/2},me=function(e){return X.exp(e)-1/X.exp(e)/2},ge=function(e){return(X.exp(e)+1/X.exp(e))/2},be=function(e){return X.exp(e)-1},we=function(e){return(X.exp(2*e)-1)/(X.exp(2*e)+1)},ye=function(e){return X.log(1+e)};var ke={default:[],apple:[{font:"-apple-system-body"}],serif:[{fontFamily:"serif"}],sans:[{fontFamily:"sans-serif"}],mono:[{fontFamily:"monospace"}],min:[{fontSize:"1px"}],system:[{fontFamily:"system-ui"}]};var Ce={fonts:function(){return P((function(e,t){var n=t.document,r=n.body;r.style.fontSize="48px";var a=n.createElement("div"),i={},o={},c=function(e){var t=n.createElement("span"),r=t.style;return r.position="absolute",r.top="0",r.left="0",r.fontFamily=e,t.textContent="mmMwWLliI0O&1",a.appendChild(t),t},s=E.map(c),u=function(){for(var e={},t=function(t){e[t]=E.map((function(e){return function(e,t){return c("'"+e+"',"+t)}(t,e)}))},n=0,r=I;n<r.length;n++){t(r[n])}return e}();r.appendChild(a);for(var l=0;l<E.length;l++)i[E[l]]=s[l].offsetWidth,o[E[l]]=s[l].offsetHeight;return I.filter((function(e){return t=u[e],E.some((function(e,n){return t[n].offsetWidth!==i[e]||t[n].offsetHeight!==o[e]}));var t}))}))},domBlockers:function(e){var t=(void 0===e?{}:e).debug;return u(this,void 0,void 0,(function(){var e,n,r;return l(this,(function(a){switch(a.label){case 0:return k()||function(){var e=y(),t=A();if(!e&&!t)return!1;var n=window;return g(["onorientationchange"in n,"orientation"in n,e&&"SharedWorker"in n,t&&/android/i.test(navigator.appVersion)])>=2}()?[4,N((r=[]).concat.apply(r,W.map((function(e){return U[e]}))))]:[2,void 0];case 1:return e=a.sent(),t&&function(e){for(var t="DOM blockers debug:\n```",n=0,r=W;n<r.length;n++){var a=r[n];t+="\n"+a+":";for(var i=0,o=U[a];i<o.length;i++){var c=o[i];t+="\n  "+c+" "+(e[c]?"🚫":"➡️")}}console.log(t+"\n```")}(e),(n=W.filter((function(t){var n=U[t];return g(n.map((function(t){return e[t]})))>.5*n.length}))).sort(),[2,n]}}))}))},fontPreferences:function(){return function(e,t){void 0===t&&(t=4e3);return P((function(n,r){var a=r.document,i=a.body,o=i.style;o.width=t+"px",o.webkitTextSizeAdjust=o.textSizeAdjust="none",y()?i.style.zoom=""+1/r.devicePixelRatio:k()&&(i.style.zoom="reset");var c=a.createElement("div");return c.textContent=d(Array(t/20<<0)).map((function(){return"word"})).join(" "),i.appendChild(c),e(a,i)}),'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">')}((function(e,t){for(var n={},r={},a=0,i=Object.keys(ke);a<i.length;a++){var o=i[a],c=ke[o],s=c[0],u=void 0===s?{}:s,l=c[1],d=void 0===l?"mmMwWLliI0fiflO&1":l,f=e.createElement("span");f.textContent=d,f.style.whiteSpace="nowrap";for(var h=0,p=Object.keys(u);h<p.length;h++){var v=p[h],m=u[v];void 0!==m&&(f.style[v]=m)}n[o]=f,t.appendChild(e.createElement("br")),t.appendChild(f)}for(var g=0,b=Object.keys(ke);g<b.length;g++){r[o=b[g]]=n[o].getBoundingClientRect().width}return r}))},audio:function(){return u(this,void 0,void 0,(function(){var e,t,n,r,a,i,o,c;return l(this,(function(s){switch(s.label){case 0:if(e=window,!(t=e.OfflineAudioContext||e.webkitOfflineAudioContext))return[2,-2];if(k()&&!C()&&!function(){var e=window;return g(["DOMRectList"in e,"RTCPeerConnectionIceEvent"in e,"SVGGeometryElement"in e,"ontransitioncancel"in e])>=3}())return[2,-1];n=4500,5e3,r=new t(1,5e3,44100),(a=r.createOscillator()).type="triangle",a.frequency.value=1e4,(i=r.createDynamicsCompressor()).threshold.value=-50,i.knee.value=40,i.ratio.value=12,i.attack.value=0,i.release.value=.25,a.connect(i),i.connect(r.destination),a.start(0),s.label=1;case 1:return s.trys.push([1,3,,4]),[4,x(r)];case 2:return o=s.sent(),[3,4];case 3:if("timeout"===(c=s.sent()).name||"suspended"===c.name)return[2,-3];throw c;case 4:return[2,M(o.getChannelData(0).subarray(n))]}}))}))},screenFrame:function(){return u(this,void 0,void 0,(function(){var e,t;return l(this,(function(n){switch(n.label){case 0:return e=function(e){return null===e?null:function(e,t){if(void 0===t&&(t=1),Math.abs(t)>=1)return Math.round(e/t)*t;var n=1/t;return Math.round(e*n)/n}(e,10)},[4,R()];case 1:return t=n.sent(),[2,[e(t[0]),e(t[1]),e(t[2]),e(t[3])]]}}))}))},osCpu:function(){return navigator.oscpu},languages:function(){var e,t=navigator,n=[],r=t.language||t.userLanguage||t.browserLanguage||t.systemLanguage;if(void 0!==r&&n.push([r]),Array.isArray(t.languages))y()&&g([!("MediaSettingsRange"in(e=window)),"RTCEncodedAudioFrame"in e,""+e.Intl=="[object Intl]",""+e.Reflect=="[object Reflect]"])>=3||n.push(t.languages);else if("string"==typeof t.languages){var a=t.languages;a&&n.push(a.split(","))}return n},colorDepth:function(){return window.screen.colorDepth},deviceMemory:function(){return m(v(navigator.deviceMemory),void 0)},screenResolution:function(){var e=screen,t=[p(e.width),p(e.height)];return t.sort().reverse(),t},hardwareConcurrency:function(){return m(p(navigator.hardwareConcurrency),void 0)},timezone:function(){var e,t=null===(e=window.Intl)||void 0===e?void 0:e.DateTimeFormat;if(t){var n=(new t).resolvedOptions().timeZone;if(n)return n}var r,a=(r=(new Date).getFullYear(),-Math.max(v(new Date(r,0,1).getTimezoneOffset()),v(new Date(r,6,1).getTimezoneOffset())));return"UTC"+(a>=0?"+":"")+Math.abs(a)},sessionStorage:function(){try{return!!window.sessionStorage}catch(e){return!0}},localStorage:function(){try{return!!window.localStorage}catch(e){return!0}},indexedDB:function(){if(!b()&&!w())try{return!!window.indexedDB}catch(e){return!0}},openDatabase:function(){return!!window.openDatabase},cpuClass:function(){return navigator.cpuClass},platform:function(){var e=navigator.platform;return"MacIntel"===e&&k()&&!C()?function(){if("iPad"===navigator.platform)return!0;var e=screen,t=e.width/e.height;return g(["MediaSource"in window,!!Element.prototype.webkitRequestFullscreen,t>2/3&&t<1.5])>=2}()?"iPad":"iPhone":e},plugins:function(){var e=navigator.plugins;if(e){for(var t=[],n=0;n<e.length;++n){var r=e[n];if(r){for(var a=[],i=0;i<r.length;++i){var o=r[i];a.push({type:o.type,suffixes:o.suffixes})}t.push({name:r.name,description:r.description,mimeTypes:a})}}return t}},canvas:function(){var e=function(){var e=document.createElement("canvas");return e.width=1,e.height=1,[e,e.getContext("2d")]}(),t=e[0],n=e[1];return function(e,t){return!(!t||!e.toDataURL)}(t,n)?{winding:L(n),geometry:B(t,n),text:z(t,n)}:{winding:!1,geometry:"",text:""}},touchSupport:function(){var e,t=navigator,n=0;void 0!==t.maxTouchPoints?n=p(t.maxTouchPoints):void 0!==t.msMaxTouchPoints&&(n=t.msMaxTouchPoints);try{document.createEvent("TouchEvent"),e=!0}catch(r){e=!1}return{maxTouchPoints:n,touchEvent:e,touchStart:"ontouchstart"in window}},vendor:function(){return navigator.vendor||""},vendorFlavors:function(){for(var e=[],t=0,n=["chrome","safari","__crWeb","__gCrWeb","yandex","__yb","__ybro","__firefox__","__edgeTrackingPreventionStatistics","webkit","oprt","samsungAr","ucweb","UCShellJava","puffinDevice"];t<n.length;t++){var r=n[t],a=window[r];a&&"object"==typeof a&&e.push(r)}return e.sort()},cookiesEnabled:function(){var e=document;try{e.cookie="cookietest=1; SameSite=Strict;";var t=-1!==e.cookie.indexOf("cookietest=");return e.cookie="cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT",t}catch(n){return!1}},colorGamut:function(){for(var e=0,t=["rec2020","p3","srgb"];e<t.length;e++){var n=t[e];if(matchMedia("(color-gamut: "+n+")").matches)return n}},invertedColors:function(){return!!H("inverted")||!H("none")&&void 0},forcedColors:function(){return!!J("active")||!J("none")&&void 0},monochrome:function(){if(matchMedia("(min-monochrome: 0)").matches){for(var e=0;e<=100;++e)if(matchMedia("(max-monochrome: "+e+")").matches)return e;throw new Error("Too high value")}},contrast:function(){return V("no-preference")?0:V("high")||V("more")?1:V("low")||V("less")?-1:V("forced")?10:void 0},reducedMotion:function(){return!!K("reduce")||!K("no-preference")&&void 0},hdr:function(){return!!$("high")||!$("standard")&&void 0},math:function(){return{acos:Z(.12312423423423424),acosh:Q(1e308),acoshPf:(e=1e154,X.log(e+X.sqrt(e*e-1))),asin:ee(.12312423423423424),asinh:te(1),asinhPf:pe(1),atanh:ne(.5),atanhPf:ve(.5),atan:re(.5),sin:ae(-1e300),sinh:ie(1),sinhPf:me(1),cos:oe(10.000000000123),cosh:ce(1),coshPf:ge(1),tan:se(-1e300),tanh:ue(1),tanhPf:we(1),exp:le(1),expm1:de(1),expm1Pf:be(1),log1p:fe(10),log1pPf:ye(10),powPI:he(-100)};var e}};function Ae(e,t,n){return u(this,void 0,void 0,(function(){var r,a,i,o,c,d,f;return l(this,(function(h){switch(h.label){case 0:r=[],a={},16,i=Date.now(),o=function(o){var c;return l(this,(function(d){switch(d.label){case 0:return function(e,t){for(var n=0,r=e.length;n<r;++n)if(e[n]===t)return!0;return!1}(n,o)?[2,"continue"]:(a[o]=void 0,r.push(function(e,t){return u(this,void 0,void 0,(function(){var n,r,a,i;return l(this,(function(o){switch(o.label){case 0:r=Date.now(),o.label=1;case 1:return o.trys.push([1,3,,4]),i={},[4,e(t)];case 2:return i.value=o.sent(),n=i,[3,4];case 3:return a=o.sent(),n={error:(c=a,c&&"object"==typeof c&&"message"in c?c:{message:c})},[3,4];case 4:return[2,s(s({},n),{duration:Date.now()-r})]}var c}))}))}(e[o],t).then((function(e){a[o]=e}))),(c=Date.now())>=i+16?(i=c,[4,new Promise((function(e){return setTimeout(e)}))]):[3,2]);case 1:return d.sent(),[3,4];case 2:return[4,void 0];case 3:d.sent(),d.label=4;case 4:return[2]}}))},c=0,d=Object.keys(e),h.label=1;case 1:return c<d.length?(f=d[c],[5,o(f)]):[3,4];case 2:h.sent(),h.label=3;case 3:return c++,[3,1];case 4:return[4,Promise.all(r)];case 5:return h.sent(),[2,a]}}))}))}function Se(e){return Ae(Ce,e,[])}function xe(e){return JSON.stringify(e,(function(e,t){return t instanceof Error?s({name:(n=t).name,message:n.message,stack:null===(r=n.stack)||void 0===r?void 0:r.split("\n")},n):t;var n,r}),2)}function Me(e){return c(function(e){for(var t="",n=0,r=Object.keys(e).sort();n<r.length;n++){var a=r[n],i=e[a],o=i.error?"error":JSON.stringify(i.value);t+=(t?"|":"")+a.replace(/([:|\\])/g,"\\$1")+":"+o}return t}(e))}var _e=function(){function e(){!function(){if(void 0===D){var e=function(){var t=G();j(t)?D=setTimeout(e,2500):(O=t,D=void 0)};e()}}()}return e.prototype.get=function(e){return void 0===e&&(e={}),u(this,void 0,void 0,(function(){var t,n;return l(this,(function(r){switch(r.label){case 0:return[4,Se(e)];case 1:return t=r.sent(),n=function(e){var t;return{components:e,get visitorId(){return void 0===t&&(t=Me(this.components)),t},set visitorId(e){t=e},version:"3.1.2"}}(t),e.debug&&console.log("Copy the text below to get the debug data:\n\n```\nversion: "+n.version+"\nuserAgent: "+navigator.userAgent+"\ngetOptions: "+JSON.stringify(e,void 0,2)+"\nvisitorId: "+n.visitorId+"\ncomponents: "+xe(t)+"\n```"),[2,n]}}))}))},e}();function Pe(e){var t=(void 0===e?{}:e).delayFallback,n=void 0===t?50:t;return u(this,void 0,void 0,(function(){return l(this,(function(e){switch(e.label){case 0:return[4,h(n,2*n)];case 1:return e.sent(),[2,new _e]}}))}))}var Te={load:Pe,hashComponents:Me,componentsToDebugString:xe},Ee=c;return e.componentsToDebugString=xe,e.default=Te,e.getComponents=Ae,e.getFullscreenElement=S,e.getScreenFrame=R,e.hashComponents=Me,e.isChromium=y,e.isDesktopSafari=C,e.isEdgeHTML=w,e.isGecko=A,e.isTrident=b,e.isWebKit=k,e.load=Pe,e.murmurX64Hash128=Ee,e}({});
function initFingerprintJSPlerdy() {
    const fpPromise = FingerprintJSPlerdy.load();
    fpPromise
        .then(fp => fp.get())
        .then(result => {
            plerdyVisitorId = result.visitorId;
            var plerdySourseBuster = false;
            plerdySourseBuster = new plerdySourseBusterFunc(sendSatistic_Before);
            // sbjs.init({
            //     plerdy:plerdy_referrals,
            //     callback: sendSatistic_Before
            // });
        });
}
initFingerprintJSPlerdy();
;function plerdySessionFunctions(){
    var _self = this;
    this.getSession = function(){
        var sesName = object.getCookieLocal('session_plerdy_v');
        if(sesName){
            object.setCookieLocal('session_plerdy_v', sesName, 0, 60*30);
            return sesName;
        }else{
            var sesName = _self.getSesName();
            object.setCookieLocal('session_plerdy_v', sesName, 0, 60*30);
            return sesName;
        }
    }
    this.getSesName = function(){
        var timestamps = (new Date()).getTime();
        var name = _self.getRandomInt(1,100)+""+_self.getRandomInt(1,100);
        var device = 'desktop';
        if (mobileAndTabletcheck()) {
            device = 'tablet';
        }
        if (mobilecheck()) {
            device = 'mobile';
        }
        if(device == "desktop"){
            name = "1"+""+name;
        }
        if(device == "mobile"){
            name = "2"+""+name;
        }
        if(device == "tablet"){
            name = "3"+""+name;
        }
        if(plerdy_config.traffic_source){
            var tsA = {'direct':"1",'organic':"2",'utm':"3","social":"4",'adwords':"5",'referral':"6"};
            if(tsA[plerdy_config.traffic_source]){
                name = tsA[plerdy_config.traffic_source] + "" + name;
            }
        }
        return (name+""+timestamps);
    }
    this.getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Включно з мінімальним та виключаючи максимальне значення
    }
}

var plerdySession = new plerdySessionFunctions();
var sesNameP; //vid_ses
var sesNamePuserSes='';// user_ses
var plerdy_selectors_for_mouse_move;
var cash_selectros_for_mouse_move = [];
var plerdy_referrals = [
    {
        host: 'web.telegram.org',
        medium: 'social',
        display: 'telegram'
    },
    {
        host: 'telegram.org',
        medium: 'social',
        display: 'telegram'
    },
    {
        host: 'linkedin.com',
        medium: 'social',
        display: 'linkedin'
    },
    {
        host: 'ok.ru',
        medium: 'social',
        display: 'ok'
    },
    {
        host: 'youtube.com',
        medium: 'social',
        display: 'youtube'
    },
    {
        host: 'viber.com',
        medium: 'social',
        display: 'viber'
    },
    {
        host: 'pinterest.com',
        medium: 'social',
        display: 'pinterest'
    },
    {
        host: 't.co',
        medium: 'social',
        display: 'twitter.com'
    },
    {
        host: 'plus.url.google.com',
        medium: 'social',
        display: 'plus.google.com'
    },
    {
        host: 'facebook.com',
        medium: 'social',
        display: 'facebook'
    },
    {
        host: 'l.facebook.com',
        medium: 'social',
        display: 'facebook'
    },
    {
        host: 'm.facebook.com',
        medium: 'social',
        display: 'facebook'
    },
    {
        host: 'instagram.com',
        medium: 'social',
        display: 'instagram'
    },
    {
        host: 'vk.com',
        medium: 'social',
        display: 'vk'
    }
];


function plerdySeoAudit(response, params, doc){
    if(plerdy_config.js_site*1 === 1){
        var document1 = document;
    }else{
        if (doc === undefined) {
            doc = '';
            var document1 = response.documentElement;
        }else{
            var document1 = doc;
        }
    }
    if(object.properties.device == 'tablet'){
        return false;
    }else{
        var data = {};
        //Title

        if(document1.querySelector('title')){
            data.page_title = document1.querySelector('title').innerHTML.trim();
        }else{
            data.page_title = '';
        }

        //Description
        var description =   document1.querySelector('head > meta[name="description"]') ||
            document1.querySelector('head > meta[name="Description"]') ||
            document1.querySelector('head > meta[name="DESCRIPTION"]') ||
            document1.querySelector('meta[name="description"]') ||
            document1.querySelector('meta[name="Description"]') ||
            document1.querySelector('meta[name="DESCRIPTION"]');
        if(description && description.content){
            data.description = description.content;
        }else{
            data.description = '';
        }

        // H1
        var h1=document1.querySelectorAll('H1');
        if(h1 && h1.length*1>0){
            data.h1 = h1[0].innerHTML.replace(/(<([^>]+)>)/ig,"");;
            if(data.h1.length > 253){
                data.h1 = data.h1.replace(/\s{2,}/g,' ').trim();
            }
            if(data.h1.length > 253){
                data.h1 = data.h1.substring(0, 253);
            }
            data.h1_cnt = h1.length;
        }else{
            data.h1 = '';
            data.h1_cnt = 0;
        }

        // H2
        var h2=document1.querySelectorAll('H2');
        if(h2 && h2.length*1>0){
            data.h2_cnt = h2.length;
        }else{
            data.h2_cnt = 0;
        }

        // H3
        var h3=document1.querySelectorAll('H3');
        if(h3 && h3.length*1>0){
            data.h3_cnt = h3.length;
        }else{
            data.h3_cnt = 0;
        }

        // H4
        var h4=document1.querySelectorAll('H4');
        if(h4 && h4.length*1>0){
            data.h4_cnt = h4.length;
        }else{
            data.h4_cnt = 0;
        }

        // H5
        var h5=document1.querySelectorAll('H5');
        if(h5 && h5.length*1>0){
            data.h5_cnt = h5.length;
        }else{
            data.h5_cnt = 0;
        }

        // property="og:description"
        var og_description_plerdy = document1.querySelector("[property='og:description']") ||
            document1.querySelector("[name='og:description']");
        if(og_description_plerdy && og_description_plerdy.getAttribute("content")){
            data.og_description = og_description_plerdy.getAttribute("content");
        }else{
            data.og_description = "";
        }

        // property="og:url"
        var og_url_plerdy = document1.querySelector("[property^='og:url']");
        if(og_url_plerdy && og_url_plerdy.getAttribute("content")){
            data.og_url = og_url_plerdy.getAttribute("content");
        }else{
            data.og_url = "";
        }

        // property="og:title"
        var og_title_plerdy = document1.querySelector("[property='og:title']");
        if(og_title_plerdy && og_title_plerdy.getAttribute("content")){
            data.og_title = og_title_plerdy.getAttribute("content");
        }else{
            data.og_title = "";
        }

        // property="og:type"
        var og_type_plerdy = document1.querySelector("[property='og:type']");
        if(og_type_plerdy && og_type_plerdy.getAttribute("content")){
            data.og_type = og_type_plerdy.getAttribute("content");
        }else{
            data.og_type = "";
        }

        // property="og:image"
        var og_image_plerdy = document1.querySelector("[property^='og:image']");
        if(og_image_plerdy && og_image_plerdy.getAttribute("content")){
            data.og_image = og_image_plerdy.getAttribute("content");
        }else{
            data.og_image = "";
        }

        // property="og:site_name"
        var og_site_name_plerdy = document1.querySelector("[property='og:site_name']");
        if(og_site_name_plerdy && og_site_name_plerdy.getAttribute("content")){
            data.og_site_name = og_site_name_plerdy.getAttribute("content");
        }else{
            data.og_site_name = "";
        }

        var images_alt = plerdyGetImagesWithMissingAlt(document1);
        data.images_without_alt_data = JSON.stringify(images_alt.data);
        //data.images_without_alt_data = images_alt.data;
        data.withoutAlt = images_alt.withoutAlt;
        data.withAlt = images_alt.withAlt;

        // if(document1.querySelector('head') && document1.querySelector('body')) {
        //     data.source =
        //         "<html>" +
        //         "<head>" +
        //         document1.querySelector('head').innerHTML + "" +
        //         "</head>" +
        //         "<body>" +
        //         document1.querySelector('body').innerHTML +
        //         "</body>" +
        //         "</html>";
        // }else{
        //     data.source = "";
        // }

        /*words = document.querySelector('BODY').innerText;*/
        var plerdy_treeWalker = '';
        plerdy_treeWalker = document.createTreeWalker(
            document1.querySelector('body'),
            NodeFilter.SHOW_ALL,
            {
                acceptNode: function (node) {
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        var words = '';
        var sent = []; // масив речень
        var words_in_sent = []; // масив кількість слів у реченні
        while (plerdy_treeWalker.nextNode()){
            if(plerdy_treeWalker.currentNode.nodeType === 3 &&
                plerdy_treeWalker.currentNode.parentNode.tagName != 'SCRIPT' &&
                plerdy_treeWalker.currentNode.parentNode.tagName != 'STYLE' &&
                plerdy_treeWalker.currentNode.parentNode.tagName != 'NOSCRIPT' &&
                plerdy_treeWalker.currentNode.parentNode.tagName != 'IFRAME' &&
                (plerdy_treeWalker.currentNode.parentNode.tagName != 'DEFS' || plerdy_treeWalker.currentNode.parentNode.tagName != 'defs') &&
                plerdy_treeWalker.currentNode.parentNode.tagName != 'SVG'
            )
            {
                if((plerdy_treeWalker.currentNode.parentNode.tagName === 'defs' || plerdy_treeWalker.parentNode.currentNodetagName === 'DEFS') ||
                    (plerdy_treeWalker.currentNode.parentNode.tagName === 'SVG' || plerdy_treeWalker.currentNode.parentNode.tagName === 'svg') ||
                    (plerdy_treeWalker.currentNode.parentNode.tagName === 'STYLE' || plerdy_treeWalker.currentNode.parentNode.tagName === 'style') ||
                    (plerdy_treeWalker.parentNode.tagName === 'defs' || plerdy_treeWalker.currentNode.tagName === 'DEFS') ||
                    (plerdy_treeWalker.parentNode.tagName === 'SVG' || plerdy_treeWalker.parentNode.tagName === 'svg') ||
                    (plerdy_treeWalker.parentNode.tagName === 'STYLE' || plerdy_treeWalker.parentNode.tagName === 'style')
                )
                {
                    //
                }else{
                    //console.log(plerdy_treeWalker.currentNode.parentNode.tagName);
                    var sstring = plerdy_treeWalker.currentNode.nodeValue.trim();
                    words = words + ' ' + sstring;
                    if( (sstring.indexOf('.')>-1 || sstring.indexOf('?')>-1 ) && sstring.indexOf(' ')>-1
                        && sstring[0] === sstring[0].toUpperCase()
                    ){
                        //sstring = sstring.replace(/([(\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '');
                        sstring = plerdyClearnString(sstring);

                        var arr = sstring.match( /[^\.!\?]+[\.!\?]+/g );
                        if(arr && arr.length > 0){
                            arr.forEach(function(ss){
                                sent.push(ss.trim());
                            });
                        }else{
                            sent.push(sstring.trim());
                        }
                    }
//                    console.log(sstring.match(/(\.|\!|\?)( |$)/g || []).length);

                }
            }
        }
        var cnt_chars = 0; // кількість букв
        sent.forEach(function(item){
            words_in_sent.push(item.replace(/\r\n?|\n/g, ' ').replace (/ {2,}/g, ' ').replace (/^ /, '').replace (/ $/, '').split (' ').length);
            cnt_chars = cnt_chars*1 + item.replace(/ /g,'').length;
        });
        var cnt_words_in_sent = words_in_sent.reduce((a, b) => a*1 + b*1, 0); // кількість слів сумарна
        var cnt_sent = sent.length; // кількість речень

        //L — среднее количество букв на 100 слов,
        var L = cnt_chars*100/cnt_words_in_sent;

        //S — среднее количество предложений на 100 слов.
        var S = cnt_sent*100/cnt_words_in_sent;
        var CLI = 0.0588*L - 0.296*S - 15.8; // Coleman–Liau index

        //automated readability index (ARI)
        var ARI = 4.71*cnt_chars/cnt_words_in_sent+0.5*cnt_words_in_sent/cnt_sent -21.43;

        var average_length_sent_in_words = plerdyAverageValue(words_in_sent); // середня довжина речення в словах

        data.average_length_sent_in_words = average_length_sent_in_words; // заміть індекса Флеша
        data.ARI = ARI?ARI:0;
        data.CLI = CLI?CLI:0;

        words = plerdyClearnWords(words);

        words = words.split(/[.,\/ ]/);
        var wordsFiltered = words.filter(function (el) {
            if(el != null && el != ''){
                el2 = el.replace(',','').replace(',','').toLowerCase();
                return el2;
            };
        });
        wordsFiltered = wordsFiltered.sort();
        wordsAnalys = JSON.stringify(
            wordsFiltered.reduce(function(acc, el){
                acc[el] = (acc[el] || 0)*1 + 1;
                return acc;
            }, {}), null, 2);
        wordsAnalys = JSON.parse(wordsAnalys);

        data.words2 = getForLua(wordsAnalys);

        var wordsAnalysSort = [];
        for (var word in wordsAnalys) {
            wordsAnalysSort.push([word, wordsAnalys[word]]);
        }

        data.words = wordsAnalysSort;


        var ArWordErrors = doSeo(wordsAnalysSort,true);
        if(ArWordErrors &&
            (      (ArWordErrors[0] && ArWordErrors[0].length*1 > 0)
                || (ArWordErrors[1] && ArWordErrors[1].length*1 > 0)
            )
        ){
            data.lat_cyrErrors = 1;
        }else{
            data.lat_cyrErrors = 0;
        }

        // Style in Tags
        var style_in_tags = document1.querySelectorAll('*[style]');
        if(style_in_tags && style_in_tags.length*1>0){
            data.style_in_tags_cnt = style_in_tags.length;
        }else{
            data.style_in_tags_cnt = 0;
        }

        // Style in BODY
        var style_in_body = document1.querySelectorAll('BODY > STYLE');
        if(style_in_body && style_in_body.length*1>0){
            data.style_in_body_cnt = style_in_body.length;
        }else{
            data.style_in_body_cnt = 0;
        }

        //all js
        var js = document1.querySelectorAll('SCRIPT');
        if(js && js.length*1>0){
            data.js_cnt = js.length;
        }else{
            data.js_cnt = 0;
        }

        //robots
        var robots = document1.querySelector('head > [name="robots"]') || document.querySelector('head > [name="ROBOTS"]');
        if(robots && robots.content){
            data.robots = robots.content;
        }else{
            data.robots = '';
        }

        //canonical
        var canonical = document1.querySelector('head > [name="canonical"]') || document1.querySelector('head > [name="CANONICAL"]') ||
            document1.querySelector('head > [rel="canonical"]') || document1.querySelector('head > [rel="CANONICAL"]');
        if(canonical && canonical.href){
            data.canonical = canonical.href;
        }else{
            data.canonical = '';
        }

        var comments = plerdy_getAllComments(document1.querySelector('*'));
        if(comments && comments.length*1>0){
            data.comments_cnt = comments.length;
        }else{
            data.comments_cnt = 0;
        }

        //a with #
        var plerdy_a = document1.querySelectorAll('a[href="#"]');
        if(plerdy_a && plerdy_a.length*1>0){
            data.a_with_diez = plerdy_a.length;
        }else{
            data.a_with_diez = 0;
        }
        sendPlerdyDataToSeo(data, params);
    }
}

function sendPlerdyDataToSeo(seoParams, params){
    //seoParams = encodeURIComponent(JSON.stringify(seoParams,null, 2));
    var seoParams = encodeURIComponent(JSON.stringify(seoParams));
    if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
        var seo_id_page = plerdy_config.id_page
    } else {
        var seo_id_page = object.getCookieLocal('id_page');
    }
    if(seo_id_page && seo_id_page*1 > 0){
        object.sendpost(seo_url, 'application/json', function (data) {
            //
        }, true, 'params=' + params + '&seoParams='+seoParams + '&seo_id_page='+seo_id_page + '&seo_do_now='+seo_do_now);
    }
}

function sendSatistic_Before(p){
    if(location.host === "serpstat.com" || location.host === "console.theviewpoint.com"){
        setTimeout(function(){
            sendSatistic(p);
        },1500);
    }else{
        sendSatistic(p);
    }
}
function getCookiePlerdy(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function plerdySerialize(obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
}

var plerdy_do_now = 0;
function sendSatistic(params) {
    object.setCookieLocal('_suid', _suid);
    object.setCookieLocal('_site_hash_code',_site_hash_code);
    plerdy_config.traffic_source = params.type;
    object.properties.traffic_source = params.type;
    var device = 'desktop';

    if (mobileAndTabletcheck()) {
        device = 'tablet';
    }
    if (mobilecheck()) {
        device = 'mobile';
    }
    object.properties.device = device;
    params.traffic_source = params.type;
    params.first_visit = plerdy_config.first_visit;
    params.user_hash = _site_hash_code;
    params.device = device;
    params.suid = _suid;
    params.url = urlencode(getPlerdy_PageUrl());
    params.page_reloaded = 0;
    params.page_title = document.title.trim();
    params.site_url = object.properties.site_url;
    params.button_name = object.getCookie('button_name');
    params.user_ses = sesNamePuserSes;
    params.vid_ses = sesNameP;
    params.trigger_id = window.plerdy_send_user_group?window.plerdy_send_user_group:0;
    if (window.performance) {
        if (performance.navigation.type !== 0) {
            params.page_reloaded = 1;
        } else {
            object.setCookieLocal('id_page', 0, 1);
        }
    } else {
        object.setCookieLocal('id_page', 0, 1);
    }

    setTimeout(function(){
        //plerdysendData = {'type':'commerce',  'data': {'order_id':2742, 'money':70738}   };
        if (typeof plerdysendData !== 'undefined') {
            plerdysend(plerdysendData.type,plerdysendData.data);
        }else{
            if(window.Shopify){
                var pUrl = getPlerdy_PageUrl();
                if(pUrl.indexOf('/orders/') > -1 && pUrl.indexOf('/account/')*1 === -1){
                    var elMoney = document.querySelector("[data-checkout-payment-due-target]");
                    if(elMoney && elMoney.dataset && elMoney.dataset.checkoutPaymentDueTarget){
                        try{
                            var Dsend = {};
                            Dsend.type = 'commerce';
                            Dsend.data = {};
                            Dsend.data.money = elMoney.dataset.checkoutPaymentDueTarget*1/100;

                            var arrUrl = pUrl.replace(location.protocol+"//"+location.host + '/', '').split('/');
                            if(arrUrl[2]){
                                Dsend.data.order_id = arrUrl[2];

                                var cntTov = document.querySelector(".product-thumbnail__quantity");
                                if(cntTov){
                                    cntTov = cntTov.innerHTML.trim();
                                    if(cntTov){
                                        Dsend.data.quantity = cntTov*1;
                                    }else{
                                        Dsend.data.quantity = 1;
                                    }
                                }else{
                                    Dsend.data.quantity = 1;
                                }
                                plerdysend(Dsend.type,Dsend.data);
                            }
                        }catch(e){
                            //
                        }
                    }
                }
            }
        }
    },2000);


    if (object.getCookieLocal('stopRequest') && (plerdy_config.check_code === 0 || !plerdy_config.check_code ) ) {
        return false;
    }
    if (params.page_reloaded !== 1 || plerdy_do_now===1 || plerdy_config.check_code === 1) {
        if(object.getCookieLocal('country_code')){
            params.country_code = object.getCookieLocal('country_code');
        }else{
            params.country_code = '';
        }
        if (object.properties.plerdy_url === 'https://test.plerdy.com/click/') {
            all_url = plerdy_config.plerdy_url_save_test + 'admin/save_statistic_test';
            seo_url = plerdy_config.plerdy_url_save_test + 'admin/seo_test';
        }else{
            all_url = plerdy_config.plerdy_url_save + 'admin/save_statistic';
            seo_url = plerdy_config.plerdy_url_save + 'admin/seo';
        }
        params.url_for_seo = getPlerdy_PageUrl();

        var host = location.host.replace('www.','');
        var url_for_id = rtrim(params.url_for_seo.replace('http://', '').replace('https://', ''), '/').replace('www.','');
        //if(url_for_id === host && window.localStorage.id_page_for_plerdy){
        //    params.id_page_for_plerdy = window.localStorage.id_page_for_plerdy;
        //}else{
        //    params.id_page_for_plerdy = '';
        //}
        params.id_page_for_plerdy = '';
        params.plerdyVisitorId = plerdyVisitorId;
        if(window.customPlerdyVisitorId){
            params.customPlerdyVisitorId = customPlerdyVisitorId;
        }else{
            params.customPlerdyVisitorId = '';
        }

        params = encodeURIComponent(JSON.stringify(params,null, 2));

        var seoTimeOut = 4000;
        if(plerdy_config.seo_do_now){
            if(plerdy_config.seo_do_now === 1){
                seo_do_now = 1;
                seoTimeOut = 4000;
            }else{
                seo_do_now = 0;
            }
        }else{
            seo_do_now = 0;
        }

        var seoParams = {};
        object.sendpost(all_url, 'application/json', function (data) {
            if (data) {
                if(plerdy_config.check_code === 1){
                    setTimeout(function (){
                        window.close();
                    },6000);
                    return false;
                }
                data = JSON.parse(data);
                if (data.id_page * 1 > 0) {
                    if(data.wrong_country && data.wrong_country*1 === 1){
                        window.plerdyDetectWrongCountry = 1;
                    }
                    if(data.sesNamePuserSes){
                        sesNamePuserSes = data.sesNamePuserSes;
                        object.setCookieLocal('sesNamePuserSes',sesNamePuserSes);
                    }
                    if(data.country_code){
                        window.country_code_plerdy = data.country_code;
                        object.setCookieLocal('country_code',window.country_code_plerdy);
                    }
                    plerdy_config.id_page = data.id_page * 1;
                    object.setCookieLocal('id_page', data.id_page * 1, 1);
                    object.properties.id_page = data.id_page * 1;
                    plerdy_config.isRecords = data.isRecords;
                    object.setCookieLocal('id_page', data.id_page * 1, 1);
                    object.properties.id_page = data.id_page * 1;
                    plerdy_config.id_page = data.id_page * 1;

                    //if(url_for_id === host){
                    //    window.localStorage.setItem('id_page_for_plerdy', data.id_page*1);
                    //}
                    if(data.js_site){
                        plerdy_config.js_site = data.js_site;
                    }else{
                        plerdy_config.js_site = 0;
                    }
                    // if(window.plerdyDetectWrongCountry && window.plerdyDetectWrongCountry*1 === 1){
                    //     return;
                    // }
                    if(data.type_track){
                        plerdyTypeTrack = data.type_track;
                    }
                    /*For SEo*/
                    plerdySeoRulesCheck();
                    //console.log(window.doSeoOrNot, 1);
                    setTimeout(function(){
                        if(device != 'tablet'){
                            //console.log(window.doSeoOrNot, 1);
                            if(location.href.indexOf('plerdy.com')*1 === -1 && navigator && navigator.doNotTrack
                                && (navigator.doNotTrack+'' === '1' || navigator.doNotTrack+'' === 'yes'))
                            {
                                // do not track
                            }else{
                                if(window.doSeoOrNot){
                                    if(plerdy_config.isRecords && plerdy_config.isRecords === 1){
                                        if(seo_do_now){
                                            plerdy_getHTML(pageUrl, plerdySeoAudit, params);
                                        }
                                    }else{
                                        plerdy_getHTML(pageUrl, plerdySeoAudit, params);
                                    }
                                }
                            }
                        }
                        //plerdySeoAudit(document,params,document);
                    },seoTimeOut);
                    /*For SEo*/
                    plerdy_config.rp = data.rp; // rp - relative position
                    plerdy_config.in_p = data.in_p; // rp - initial position
                    object.setCookieLocal('in_p',plerdy_config.in_p);
                    object.setCookieLocal('rp',plerdy_config.rp);

                    if(data.v_save && data.v_save*1 == 1){
                        proccesVideoData(data);
                    }else{
                        object.setCookieLocal('v_save', 0, 1);
                    }
                    initGaEvents();
                    if(data.loadConverssion && data.loadConverssion*1 == 1){
                        object.setCookieLocal('loadConverssion', 1);
                        proccesConverssionData();
                    }else{
                        object.setCookieLocal('loadConverssion', 0);
                    }
                    object.ipAction();

                } else {
                    object.setCookieLocal('id_page', 0, 1);
                    plerdy_config.id_page = 0;
                }
                if (data.message == 'stop') {
                    endDay = new Date(plerdy_currentDate() + ' 23:59:59');
                    now = new Date();
                    seconds = parseInt((endDay.getTime()-now.getTime())/1000);
                    object.setCookieLocal('stopRequest', '1', 0,seconds);
                    object.setCookieLocal('id_page', 0, 1);
                }
                if(!data.allowSavePageViews){
                    const c_endDay = new Date(plerdy_currentDate() + ' 23:59:59');
                    const c_now = new Date();
                    const c_seconds = parseInt((c_endDay.getTime()-c_now.getTime())/1000);
                    object.setCookieLocal('stopCollectClicks', '1', 0, c_seconds);
                }
            } else {
                object.setCookieLocal('id_page', 0, 1);
            }
        }, true, 'params=' + params + '&seoParams='+seoParams);
    }else{
        sesNamePuserSes = object.getCookieLocal('sesNamePuserSes');
        var loadConverssion = object.getCookieLocal('loadConverssion');
        if(loadConverssion){
            object.setCookieLocal('loadConverssion', 1);
            proccesConverssionData();
        }
        initGaEvents();
        var v_save = object.getCookieLocal('v_save');
        var id_page = object.getCookieLocal('id_page');
        if(v_save*1 > 0 && id_page*1>0 && v_save*1 === id_page*1){
            proccesVideoData();
        }
        object.ipAction();
    }
}

function urlencode(str) {
    str = (str + '')
        .toString();

    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .
        replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+');
}


function plerdy_currentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
}

function plerdy_filterNone() {
    return NodeFilter.FILTER_ACCEPT;
}

function plerdy_getAllComments(rootElem) {
    var comments = [];
    // Fourth argument, which is actually obsolete according to the DOM4 standard, is required in IE 11
    var iterator = document.createNodeIterator(rootElem, NodeFilter.SHOW_COMMENT, plerdy_filterNone, false);
    var curNode;
    while (curNode = iterator.nextNode()) {
        comments.push(curNode.nodeValue);
    }
    return comments;
}


var plerdy_getHTML = function ( url, callback, params ) {

    // Feature detection
    if ( !window.XMLHttpRequest ) return;

    // Create new request
    var xhr = new XMLHttpRequest();

    // Setup callback
    xhr.onload = function() {
        if ( callback && typeof( callback ) === 'function' ) {
            callback( this.responseXML, params );
        }
    }

    // Get the HTML
    xhr.open( 'GET', url );
    xhr.responseType = 'document';
    xhr.send();

};
function plerdyAverageValue(arr) {
    var
        x, correctFactor = 0,
        sum = 0
    ;
    for (var x = 0; x < arr.length; x++) {
        arr[x] = +arr[x];
        if (!isNaN(arr[x])) {
            sum += arr[x];
        } else {
            correctFactor++;
        }
    }
    var res = (sum / (arr.length - correctFactor)).toFixed(2);
    return (res && !isNaN(res)) ?res:0;
}

function proccesVideoData(data){
    var p_vid_rules = document.querySelector("[data-p_vid_rules='p_vid_rules']");
    if(p_vid_rules){
        p_vid_rules.parentNode.removeChild(p_vid_rules);
    }

    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.dataset.p_vid_rules = 'p_vid_rules';
    s.setAttribute('defer','');
    //s.src = plerdy_config.plerdy_url0 + 'public/screens/'+_suid+'/plerdy_video_rules.js';
    s.src = MAINPLERDYURL + 'public/screens/'+_suid+'/plerdy_video_rules.js?v='+ Math.random();
    try {
        document.getElementsByTagName('head')[0].appendChild(s);
        //document.body.appendChild(s);
    } catch (e) {
        //console.log(e)
    }
    s.onload = function(){
        if(data === undefined){
            data = '';
        }
        var plerdy_page_recorder = document.querySelector("[data-p_vid='p_vid']");
        if(plerdy_page_recorder){
            plerdy_page_recorder.parentNode.removeChild(plerdy_page_recorder);
            rrwebRecord = "";
            sesNameP = "";
            sesNameP = plerdySession.getSesName(); //vid_ses
        }

        if(plerdy_config.id_page && plerdy_config.id_page*1 !== 0){
            var id_pageF = plerdy_config.id_page;
        }else{
            var id_pageF = object.getCookieLocal('id_page');
        }
        var  appendScript = false;
        var time_to_show = 0;
        if (typeof plerdy_video_rules !== 'undefined') {
            if(plerdy_video_rules.length*1 > 0){
                plerdy_video_rules.forEach(function(rule){
                    if(!appendScript){
                        if(rule.type*1 === 1){
                            if(rule.id_page*1 === id_pageF*1){
                                var aa = document.createElement('a');
                                aa.href = '//'+rule.url;
                                if(rtrim(aa.href,'/').replace('www.','') === rtrim(getPlerdy_PageUrl(),'/').replace('www.','')){
                                    appendScript = true;
                                }else{
                                    appendScript = false;
                                }
                            }
                        }else{
                            if(rule.url === '/'){
                                appendScript = true;
                            }else{
                                rule.url = rtrim(rule.url,'/');
                                var pageUrl2 = pageUrl.replace(window.location.hostname,'')
                                if(pageUrl2.indexOf(rule.url) > -1 || pageUrl.indexOf(rule.url) > -1){
                                    appendScript = true;
                                }
                            }
                        }
                        if(appendScript){
                            if(rule.time_to_show && rule.time_to_show*1 > 0){
                                time_to_show = rule.time_to_show;
                            }
                            if(window.country_code_plerdy){
                                if(rule.countries && rule.countries.length*1>0){
                                    if( rule.countries[0] === "all"){
                                        //
                                    }else{
                                        if(inArray(window.country_code_plerdy,rule.countries)*1 > -1){
                                            appendScript = true;
                                        }else{
                                            appendScript = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                if(plerdy_video_rules[0] && plerdy_video_rules[0]['user_group_s']){
                    if(window.plerdy_send_user_group){
                        if(plerdy_video_rules[0]['user_group_s'].indexOf(','+window.plerdy_send_user_group+',') > -1){

                        }else{
                            appendScript = false;
                        }
                    }else{
                        appendScript = false;
                    }
                }

            }
        }

        if(appendScript){
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.dataset.p_vid = 'p_vid';
            s.src = plerdy_config.plerdy_url0 + 'public/js/click/for_video/plerdy_page_recorder.js?v='+ Math.random();;
            try {
                setTimeout(function(){
                    document.getElementsByTagName('head')[0].appendChild(s);
                    //document.body.appendChild(s);
                },time_to_show*1000)
            } catch (e) {}
            if(data){
                object.setCookieLocal('v_save', data.id_page*1, 1);
            }
        }
    }
}
function initGaEvents(){
    var plerdy_ga_eventsNode = document.querySelector("[data-plerdy_ga_events='plerdy_ga_events']");
    if(plerdy_ga_eventsNode){
        plerdy_ga_eventsNode.parentNode.removeChild(plerdy_ga_eventsNode);
    }
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.dataset.plerdy_ga_events = 'plerdy_ga_events';
    //s.src = plerdy_config.plerdy_url0 + 'public/screens/'+_suid+'/plerdy_ga_events.js';
    s.src = MAINPLERDYURL + 'public/screens/'+_suid+'/plerdy_ga_events.js?v='+ Math.random();
    try {
        document.getElementsByTagName('head')[0].appendChild(s);
        //document.body.appendChild(s);
    } catch (e) {}

    var plerdy_ga_eventsFILE = document.querySelector("[data-plerdy_ga_events_FILE='plerdy_ga_events_FILE']");
    if(plerdy_ga_eventsFILE){
        plerdy_ga_eventsFILE.parentNode.removeChild(plerdy_ga_eventsFILE);
    }
    s.onload = function () {
        if(plerdy_ga_events !== undefined){
            if(plerdy_ga_events.length*1 >= 1){
                object.appendScript('plerdy_ga_events.js');
            }
        }
    };
}

/**
 *
 * @param {string} type
 * @param {object} data
 * @returns {Boolean}
 */
function plerdysend(type,data){
    if (type === undefined){
        return false;
    }
    if(data.constructor !== Object){
        return false;
    }
    if(Object.keys(data).length === 0){
        return false;
    }
    if(type === 'commerce'){
        setTimeout(function(){
            return plerdyCommerse(data);
        },1000)

    }
}

/**
 *
 * @param {object} data
 * data={''}
 * @returns {boolean}
 */
function plerdyCommerse(data){
    if(data.order_id*1 === 0){
        return false;
    }
    var commerceData = object.getCookieLocal('commerce');
    if(commerceData === data.order_id + '_'+sesNamePuserSes){
        return false;
    }

    var params = {};
    if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
        params.id_page = plerdy_config.id_page
    } else {
        params.id_page = object.getCookieLocal('id_page');
    }
    if(params.id_page*1 === 0){
        return false;
    }
    params.traffic_source = object.properties.traffic_source;
    params.unique_sessions = plerdy_config.first_visit;
    params.device = object.properties.device;
    params.suid = object.properties.suid;
    params.user_hash = object.properties.user_hash;
    params.site_url = object.properties.site_url;
    params.url = getPlerdy_PageUrl();
    params.user_ses = sesNamePuserSes;
    params.value = data.money;
    if(data.quantity){
        params.quantity = data.quantity;
    }else{
        params.quantity = 1;
    }
    params.order_id = data.order_id;
    if (object.properties.plerdy_url == 'https://test.plerdy.com/click/') {
        var url = plerdy_config.plerdy_url_save_test + 'commerce_t';
    } else {
        var url = plerdy_config.plerdy_url_save + 'commerce';
    }
    params.trigger_id = window.plerdy_send_user_group?window.plerdy_send_user_group:0;
    params = encodeURIComponent(JSON.stringify(params));
    object.sendpost(url, 'application/json', function (data1) {
        object.setCookieLocal('commerce',''+data.order_id + '_' + sesNamePuserSes, 1);
    }, true, 'params=' + params);
}

function proccesConverssionData(){
    var plerdy_conversions_steps = document.querySelector("[data-plerdy_conversions_steps='plerdy_conversions_steps']");
    if(plerdy_conversions_steps){
        doPlerdyConvStep();
    }else{
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.dataset.plerdy_conversions_steps = 'plerdy_conversions_steps';
        //s.src = plerdy_config.plerdy_url0 + 'public/screens/'+_suid+'/plerdy_conversions_steps.js';
        s.src = MAINPLERDYURL + 'public/screens/'+_suid+'/plerdy_conversions_steps.js?v='+ Math.random();
        s.setAttribute('defer','');
        try {
            document.getElementsByTagName('head')[0].appendChild(s);
            //document.body.appendChild(s);
        } catch (e) {}
        s.onload = function(){
            doPlerdyConvStep();
        }
    }
}

function doPlerdyConvStep(){
    var strong, convOb = [], realPageUrl;
    if (window.plerdy_conversions_steps && window.plerdy_conversions_steps.length*1 > 0) {
        for(let i in window.plerdy_conversions_steps){
            var conv = window.plerdy_conversions_steps[i]; // one converssion
            var converssion_id = conv.conv_id;
            strong = conv.strong;
            realPageUrl = decodeURIComponent(rtrim(pageUrl,'/'));
            if(conv && conv.steps){
                var was = 0;
                for(let j in conv.steps){
                    if(was*1 === 0){
                        if(conv.steps[j]['url']){
                            //realPageUrl = decodeURIComponent(pageUrl);
                            if( (typeof conv.steps[j]['url']) == "string"){
                                var step = decodeURIComponent(conv.steps[j]['url']);
                                // contains - 0
                                // equel - 1
                                // begin - 2
                                // end - 3
                                if(conv.steps[j]['rule_type']+'' === '0'){
                                    var realPageUrlSLESH = realPageUrl + '/';
                                    if(realPageUrl.indexOf(conv.steps[j]['url']) > -1  ||  realPageUrlSLESH.indexOf(conv.steps[j]['url']) > -1){
                                        convOb.push({'converssion_id':converssion_id, 'converssion_step_id': j*1+1, 'user_ses': sesNamePuserSes, 'strong':strong, 'save':0});
                                        was = 1;
                                    }
                                }else if(conv.steps[j]['rule_type']+'' === '1'){
                                    if(realPageUrl === rtrim(conv.steps[j]['url'],'/') ){
                                        convOb.push({'converssion_id':converssion_id, 'converssion_step_id': j*1+1, 'user_ses': sesNamePuserSes, 'strong':strong, 'save':0});
                                        was = 1;
                                    }
                                }else if(conv.steps[j]['rule_type']+'' === '2'){
                                    if(realPageUrl.indexOf(conv.steps[j]['url'])*1 === 0){
                                        convOb.push({'converssion_id':converssion_id, 'converssion_step_id': j*1+1, 'user_ses': sesNamePuserSes, 'strong':strong, 'save':0});
                                        was = 1;
                                    }
                                }else if(conv.steps[j]['rule_type']+'' === '3'){
                                    var reverseStringStep = conv.steps[j]['url'].split("").reverse().join("");
                                    var reverseStringUrl = realPageUrl.split("").reverse().join("");
                                    if(reverseStringUrl.indexOf(reverseStringStep)*1 === 0){
                                        convOb.push({'converssion_id':converssion_id, 'converssion_step_id': j*1+1, 'user_ses': sesNamePuserSes, 'strong':strong, 'save':0});
                                        was = 1;
                                    }
                                }
                            }
                        }else{
                            // old but works!!!
                            if( (typeof conv.steps[j]) == "string"){
                                var step = decodeURIComponent(rtrim(conv.steps[j],'/'));
                                if(validConverssionURL(step) && step.indexOf('http')>-1){
                                    if(step == realPageUrl){
                                        convOb.push({'converssion_id':converssion_id, 'converssion_step_id': j*1+1, 'user_ses': sesNamePuserSes, 'strong':strong, 'save':0});
                                        was = 1;
                                    }
                                }else{
                                    if(realPageUrl.indexOf(step)*1 > -1){
                                        convOb.push({'converssion_id':converssion_id, 'converssion_step_id': j*1+1, 'user_ses': sesNamePuserSes, 'strong':strong, 'save':0});
                                        was = 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }
    }
    converssion_id = "";
    if(convOb.length*1 > 0){
        sendConv_v2(convOb);
        for(let i in convOb){
            var currentConv = convOb[i];
            var p_convers = object.getCookieLocal("p_convers"+currentConv.user_ses+"-"+currentConv.converssion_id);
            if(p_convers){
                p_convers = JSON.parse(p_convers);
                if(p_convers && p_convers.user_ses ==currentConv.user_ses){
                    var converssion_step_id = p_convers['converssion_step_id'];
                    var converssion_id = p_convers['converssion_id'];
                    if(converssion_id*1 === currentConv.converssion_id*1){
                        if(converssion_step_id*1+1 === 1*currentConv.converssion_step_id){
                            convOb[i].save = 1;
                            object.setCookieLocal("p_convers"+currentConv.user_ses+"-"+currentConv.converssion_id,JSON.stringify(currentConv),0,60*30);
                        }
                    }
                }
            }else{
                if(currentConv.converssion_step_id*1 === 1){
                    convOb[i].save = 1;
                    object.setCookieLocal("p_convers"+currentConv.user_ses+"-"+currentConv.converssion_id,JSON.stringify(currentConv),0,60*30);
                }
            }
        }
    }
    if(convOb && convOb.length){
        for(var i in convOb){
            if(convOb[i].save*1 === 0){
                convOb.splice(i,1);
            }
        }
    }
    if(convOb && convOb.length){
        if (object.properties.plerdy_url == 'https://test.plerdy.com/click/') {
            var url = plerdy_config.plerdy_url_save_test + 'admin/save_converssion_test';
        }else{
            var url = plerdy_config.plerdy_url_save + 'admin/save_converssion'
        }
        var params = {}
        if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
            params.id_page = plerdy_config.id_page
        } else {
            params.id_page = object.getCookieLocal('id_page');
        }
        var id_page_v = params.id_page;
        params.traffic_source = getTrafficsPlerdyArr(object.properties.traffic_source);
        params.unique_sessions = plerdy_config.first_visit
        params.device = getDevicePlerdyArr(object.properties.device);
        params.suid = object.properties.suid;
        params.user_hash = object.properties.user_hash;
        params.site_url = object.properties.site_url;
        params.url = getPlerdy_PageUrl();
        params.trigger_id = window.plerdy_send_user_group?window.plerdy_send_user_group:0;
        params.v = 1;

        params = encodeURIComponent(JSON.stringify(params));
        convOb = encodeURIComponent(JSON.stringify(convOb));
        object.sendpost(url, 'application/json', function (data) {
            //
        }, true, 'params=' + params + '&convOb='+convOb );
    }
}

function validConverssionURL(str) {
    var regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str))
    {
        return true;
    }
    else
    {
        return false;
    }
}


function getTrafficsPlerdyArr(ts){
    var mas = {'direct':"1",'organic':"2",'utm':"3","social":"4",'adwords':"5",'referral':"6"};
    if(ts && mas[ts]){
        return mas[ts]
    }else{
        return "1";
    }
}

function getDevicePlerdyArr(device){
    var mas = {'desktop':"1",'mobile':"2",'tablet':"3"};
    if(device && mas[device]){
        return mas[device]
    }else{
        return "1";
    }
}

function plerdySeoRulesCheck(){
    var plerdy_seo_rules1 = document.querySelector("[data-plerdy_seo_rules='plerdy_seo_rules']");
    if(plerdy_seo_rules1){
        plerdyDetectIfAlloved();
    }else{
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.dataset.plerdy_seo_rules = 'plerdy_seo_rules';
        //s.src = plerdy_config.plerdy_url0 + 'public/screens/'+_suid+'/plerdy_seo_rules.js?v='+ Math.random();
        s.src = MAINPLERDYURL + 'public/screens/'+_suid+'/plerdy_seo_rules.js?v='+ Math.random();
        s.setAttribute('defer','');
        try {
            document.getElementsByTagName('head')[0].appendChild(s);
            //document.body.appendChild(s);
        } catch (e) {}
        s.onload = function(){
            plerdyDetectIfAlloved();
        }
    }
}

function plerdyDetectIfAlloved(){
    if (window.plerdy_seo_rules) {
        window.plerdy_seo_rules2 = ["User-agent: *"];

        for(let j in window.plerdy_seo_rules){
            window.plerdy_seo_rules2.push("Disallow: "+window.plerdy_seo_rules[j]);
        }
        var robotsRules = new PlerdyRobots(pageUrl,window.plerdy_seo_rules2.join('\n'));
        var ress = robotsRules.isAllowed(pageUrl);
        if(ress){
            window.doSeoOrNot = true;
        }else{
            window.doSeoOrNot = false;
        }
    }else{
        window.doSeoOrNot = false;
    }
}

function sendConv_v2(convOb){
    if (object.properties.plerdy_url == 'https://test.plerdy.com/click/') {
        var url = plerdy_config.plerdy_url_save_test + 'admin/save_converssion_test';
    }else{
        var url = plerdy_config.plerdy_url_save + 'admin/save_converssion'
    }
    var params = {}
    if (plerdy_config.id_page && plerdy_config.id_page * 1 > 0) {
        params.id_page = plerdy_config.id_page
    } else {
        params.id_page = object.getCookieLocal('id_page');
    }
    var id_page_v = params.id_page;
    params.traffic_source = getTrafficsPlerdyArr(object.properties.traffic_source);
    params.unique_sessions = plerdy_config.first_visit
    params.device = getDevicePlerdyArr(object.properties.device);
    params.suid = object.properties.suid;
    params.user_hash = object.properties.user_hash;
    params.site_url = object.properties.site_url;
    params.url = getPlerdy_PageUrl();
    params.user_ses = sesNamePuserSes;
    params.trigger_id = window.plerdy_send_user_group?window.plerdy_send_user_group:0;
    params.v = 2;

    params = encodeURIComponent(JSON.stringify(params));
    convOb = encodeURIComponent(JSON.stringify(convOb));
    object.sendpost(url, 'application/json', function (data) {
        //
    }, true, 'params=' + params + '&convOb='+convOb );
}

function plerdyClearnWords(words, lover){
    if(lover === undefined){
        lover = true;
    }
    words = words.replace(/([(\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '');
    words = words.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '');
    words = words.replace(/(^\s*)|(\s*$)/gi,"");
    words = words.replace(/[ ]{2,}/gi," ");
    words = words.replace(/\n /,"\n");
    words = words.replace(/\b\d+\b/gi,"");
    words = words.replace(/”/g," ");
    words = words.replace(/»/g," ");
    words = words.replace(/«/g," ");
    words = words.replace(/…/g," ");
    words = words.replace(/“/g,'');
    words = words.replace(/\&\#8596;/g," ");
    words = words.replace(/\.\.\./g," ");
    words = words.split('"').join(' ');
    words = words.split(',').join(' ');
    words = words.split(';').join(' ');
    words = words.replace(/“/g,'');
    words = words.replace(/(?:\r\n|\r|\n)/g, ' ');
    words = words.replace(/\s+/g,' ');
    words = words.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
    words = words.replace(',', '')
    if(lover){
        words = words.toLowerCase();
    }
    words = words.replace(/\&shy;/gi, "");
    words = words.replace(/\&#173;/gi, "");
    words = words.replace(/&amp;|&lt;|&gt|&quot;|&ndash;|&mdash;|&ensp;|&emsp;|&nbsp;|&shy;|&copy;|&trade;|&reg/gi, "").replace(/(\&shy;|­|&#173;)/gi, "");
    words = words.replace( /[\u2070-\u209F\u00B2\u00B3\u00B9]/gi, '');
    return words;
}

function plerdyClearnString(sstring){
    sstring = sstring.replace(/&amp;|&lt;|&gt|&quot;|&ndash;|&mdash;|&ensp;|&emsp;|&nbsp;|&shy;|&copy;|&trade;|&reg/gi, "").replace(/(\&shy;|­|&#173;)/gi, "");
    sstring = sstring.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '');
    sstring = sstring.replace(/(^\s*)|(\s*$)/gi,"");
    sstring = sstring.replace(/[ ]{2,}/gi," ");
    sstring = sstring.replace(/\n /,"\n");
    //sstring = sstring.replace(/[0-9]/gi,"");
    sstring = sstring.replace(/\b\d+\b/gi,"");
    sstring = sstring.split('"').join(' ');
    sstring = sstring.split(',').join(' ');
    sstring = sstring.split(';').join(' ');
    sstring = sstring.replace(/(?:\r\n|\r|\n)/g, ' ');
    sstring = sstring.replace(/\s+/g,' ');
    sstring = sstring.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
    sstring = sstring.replace( /[\u2070-\u209F\u00B2\u00B3\u00B9]/gi, '');
    sstring = sstring.replace(/\&shy;/gi, "");
    sstring = sstring.replace(/\&#173;/gi, "");
    return sstring;
}


function getForLua(wordsAnalys){
    var wordsAnalysSort = [];
    for (var word in wordsAnalys) {
        if(word && word.length > 3){
            wordsAnalysSort.push([word, wordsAnalys[word]]);
        }
    }
    for (var i_counter = 0; i_counter < wordsAnalysSort.length; i_counter++) {
        var w1 = wordsAnalysSort[i_counter][0];
        if(w1 && w1.length > 3){
            for (var j_counter = i_counter + 1; j_counter < wordsAnalysSort.length; j_counter++) {
                var w2 = wordsAnalysSort[j_counter][0];
                if (w1 && w2 && w1.length == 4 && w2.length == 4) {
                    if (w1 === w2 || w1 === w2.substring(0, w2.length - 1) || w2 === w1.substring(0, w1.length - 1) ||
                        w1.substring(0, w1.length - 1) === w2.substring(0, w2.length - 1)
                    )
                    {
                        var c = wordsAnalysSort[j_counter][1] * 1 + wordsAnalysSort[i_counter][1] * 1;
                        wordsAnalysSort[i_counter][1] = c;
                        wordsAnalysSort[i_counter][0] = w1;
                        if (wordsAnalysSort[i_counter][2] === undefined) {
                            wordsAnalysSort[i_counter][2] = w1 + ',' + w2;
                        } else {
                            wordsAnalysSort[i_counter][2] = wordsAnalysSort[i_counter][2] + ',' + w1 + ',' + w2;
                        }

                        wordsAnalysSort[j_counter][1] = null;
                        wordsAnalysSort[j_counter][0] = null;
                    }
                } else if (w1 && w2 && w1.length > 3 && w2.length > 3) {
                    if (w1 === w2 || w1 === w2.substring(0, w2.length - 1) || w2 === w1.substring(0, w1.length - 1) ||
                        w1 === w2.substring(0, w2.length - 2) || w2 === w1.substring(0, w1.length - 2) ||
                        w1 === w2.substring(0, w2.length - 3) || w2 === w1.substring(0, w1.length - 3) ||
                        w1.substring(0, w1.length - 1) === w2.substring(0, w2.length - 1) ||
                        w1.substring(0, w1.length - 2) === w2.substring(0, w2.length - 2)
                    )
                    {
                        var c = wordsAnalysSort[j_counter][1] * 1 + wordsAnalysSort[i_counter][1] * 1;
                        wordsAnalysSort[i_counter][1] = c;
                        wordsAnalysSort[i_counter][0] = w1;
                        if (wordsAnalysSort[i_counter][2] === undefined) {
                            wordsAnalysSort[i_counter][2] = w1 + ',' + w2;
                        } else {
                            wordsAnalysSort[i_counter][2] = wordsAnalysSort[i_counter][2] + ',' + w1 + ',' + w2;
                        }

                        wordsAnalysSort[j_counter][1] = null;
                        wordsAnalysSort[j_counter][0] = null;
                    }
                }
            }
        }

    }
    for (var i_counter = 0; i_counter < wordsAnalysSort.length; i_counter++) {
        if (wordsAnalysSort[i_counter][2] !== undefined) {
            var ss = wordsAnalysSort[i_counter][2].split(',');
            if (ss[0] === wordsAnalysSort[i_counter][0]) {
                for (var j_counter = 2; j_counter < 100; j_counter = j_counter + 2) {
                    if (ss[j_counter] !== undefined) {
                        ss[j_counter] = null;
                    }
                }
                wordsAnalysSort[i_counter][0] = ss.filter(Boolean).join(',');
                delete wordsAnalysSort[i_counter][2];
                wordsAnalysSort[i_counter].length = 2;
            }
        }
    }
    wordsAnalysSort.sort(function (a, b) {
        return b[1] - a[1];
    });

    var filtered = wordsAnalysSort.filter(function (value, index, arr) {
        if (value[0] != null && (typeof value[0] === "string" || typeof value[0] === "number") && value[0].charCodeAt(0) !== 55357) {
            return value;
        }

    });
    return filtered;
}

function plerdyGetImagesWithMissingAlt(document1){
    var pl_host = location.host;
    var plerdyAllImg = document1.querySelectorAll('img');
    var dat = [];
    var withAlt = 0;
    var withoutAlt = 0;
    for (let pl_ii = 0; pl_ii < plerdyAllImg.length; pl_ii++){
        if(plerdyAllImg[pl_ii]){
            // if( (plerdyAllImg[pl_ii].getAttribute('src') && plerdyAllImg[pl_ii].getAttribute('src').indexOf(pl_host) > -1  ) ||
            //     (plerdyAllImg[pl_ii].getAttribute('src') && plerdyAllImg[pl_ii].getAttribute('src').indexOf(pl_host) === -1 && plerdyAllImg[pl_ii].getAttribute('src').indexOf('http') === -1  )
            // )
            if( plerdyAllImg[pl_ii].getAttribute('src') && plerdyAllImg[pl_ii].getAttribute('src').length > 0)
            {
                var ff = {};
                ff.src = plerdyAllImg[pl_ii].getAttribute('src');
                ff.alt = plerdyAllImg[pl_ii].getAttribute('alt');
                if(ff.alt){
                    withAlt = withAlt*1 + 1;
                }else{
                    withoutAlt = withoutAlt*1 + 1;
                    dat.push(ff);
                }
            }
        }
    }
    var dd = {};
    dd.data = dat;
    dd.withAlt = withAlt;
    dd.withoutAlt = withoutAlt;
    return dd;
}
;function PlerdyRobots(url, contents) {
    this._url = parseUrl(url) || {};
    this._url.port = this._url.port || 80;

    this._rules = {};
    this._sitemaps = [];
    this._preferredHost = null;

    var _self = this;

    function parseUrl(url) {
        try {
            return new URL(url);
        } catch (e) {
            return null;
        }
    }

    function parseRobots(contents) {
        var newlineRegex = /\r\n|\r|\n/;
        var lines = contents
                .split(newlineRegex)
                .map(removeComments)
                .map(splitLine)
                .map(trimLine);

        var currentUserAgents = [];
        var isNoneUserAgentState = true;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (!line || !line[0]) {
                continue;
            }

            switch (line[0].toLowerCase()) {
                case 'user-agent':
                    if (isNoneUserAgentState) {
                        currentUserAgents.length = 0;
                    }

                    if (line[1]) {
                        currentUserAgents.push(formatUserAgent(line[1]));
                    }
                    break;
                case 'disallow':
                    _self.addRule(currentUserAgents, line[1], false, i + 1);
                    break;
                case 'allow':
                    _self.addRule(currentUserAgents, line[1], true, i + 1);
                    break;
                case 'crawl-delay':
                    _self.setCrawlDelay(currentUserAgents, line[1]);
                    break;
                case 'sitemap':
                    if (line[1]) {
                        _self.addSitemap(line[1]);
                    }
                    break;
                case 'host':
                    if (line[1]) {
                        _self.setPreferredHost(line[1].toLowerCase());
                    }
                    break;
            }

            isNoneUserAgentState = line[0].toLowerCase() !== 'user-agent';
        }
    }


    /**
     * Remove comments from lines
     *
     * @param {string} line
     * @return {string}
     * @private
     */
    function removeComments(line) {
        var commentStartIndex = line.indexOf('#');
        if (commentStartIndex > -1) {
            return line.substr(0, commentStartIndex);
        }

        return line;
    }

    /**
     * Splits a line at the first occurrence of :
     *
     * @param  {string} line
     * @return {Array.<string>}
     * @private
     */
    function splitLine(line) {
        var idx = String(line).indexOf(':');

        if (!line || idx < 0) {
            return null;
        }

        return [line.slice(0, idx), line.slice(idx + 1)];
    }
    /**
     * Trims the white space from the start and end of the line.
     *
     * If the line is an array it will strip the white space from
     * the start and end of each element of the array.
     *
     * @param  {string|Array} line
     * @return {string|Array}
     * @private
     */
    function trimLine(line) {
        if (!line) {
            return null;
        }

        if (Array.isArray(line)) {
            return line.map(trimLine);
        }

        return String(line).trim();
    }
    /**
     * Normalises the user-agent string by converting it to
     * lower case and removing any version numbers.
     *
     * @param  {string} userAgent
     * @return {string}
     * @private
     */
    function formatUserAgent(userAgent) {
        var formattedUserAgent = userAgent.toLowerCase();

        // Strip the version number from robot/1.0 user agents
        var idx = formattedUserAgent.indexOf('/');
        if (idx > -1) {
            formattedUserAgent = formattedUserAgent.substr(0, idx);
        }

        return formattedUserAgent.trim();
    }
    /**
     * Adds the specified allow/deny rule to the rules
     * for the specified user-agents.
     *
     * @param {Array.<string>} userAgents
     * @param {string} pattern
     * @param {boolean} allow
     * @param {number} [lineNumber] Should use 1-based indexing
     */
    this.addRule = function (userAgents, pattern, allow, lineNumber) {

        userAgents.forEach(function (userAgent) {
            _self._rules[userAgent] = _self._rules[userAgent] || [];

            if (!pattern) {
                return;
            }

            _self._rules[userAgent].push({
                pattern: parsePattern(pattern),
                allow: allow,
                lineNumber: lineNumber
            });
        });
    };

    /**
     * Converts the pattern into a regexp if it is a wildcard
     * pattern.
     *
     * Returns a string if the pattern isn't a wildcard pattern
     *
     * @param  {string} pattern
     * @return {string|RegExp}
     * @private
     */
    function parsePattern(pattern) {
        var regexSpecialChars = /[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g;
        // Treat consecutive wildcards as one (#12)
        var wildCardPattern = /\*+/g;
        var endOfLinePattern = /\\\$$/;

        pattern = normaliseEncoding(pattern)

        if (pattern.indexOf('*') < 0 && pattern.indexOf('$') < 0) {
            return pattern;
        }

        pattern = pattern
                .replace(regexSpecialChars, '\\$&')
                .replace(wildCardPattern, '(?:.*)')
                .replace(endOfLinePattern, '$');

        return new RegExp(pattern);
    }

    /**
     * Adds the specified delay to the specified user agents.
     *
     * @param {Array.<string>} userAgents
     * @param {string} delayStr
     */
    this.setCrawlDelay = function (userAgents, delayStr) {
        var delay = Number(delayStr);

        userAgents.forEach(function (userAgent) {
            _self._rules[userAgent] = _self._rules[userAgent] || [];

            if (isNaN(delay)) {
                return;
            }

            _self._rules[userAgent].crawlDelay = delay;
        });
    };
    /**
     * Add a sitemap
     *
     * @param {string} url
     */
    this.addSitemap = function (url) {
        _self._sitemaps.push(url);
    };

    /**
     * Sets the preferred host name
     *
     * @param {string} url
     */
    this.setPreferredHost = function (url) {
        this._preferredHost = url;
    };


    /**
     * Normalises the URL encoding of a path by encoding
     * unicode characters.
     * 
     * @param {string} path
     * @return {string}
     * @private
     */
    function normaliseEncoding(path) {
        try {
            return urlEncodeToUpper(encodeURI(path).replace(/%25/g, '%'));
        } catch (e) {
            return path;
        }
    }

    /**
     * Convert URL encodings to support case.
     *
     * e.g.: %2a%ef becomes %2A%EF
     *
     * @param {string} path
     * @return {string}
     * @private
     */
    function urlEncodeToUpper(path) {
        return path.replace(/%[0-9a-fA-F]{2}/g, function (match) {
            return match.toUpperCase();
        });
    }


    /**
     * Returns true if allowed, false if not allowed.
     *
     * Will return undefined if the URL is not valid for
     * this robots.txt file.
     *
     * @param  {string}  url
     * @param  {string?}  ua
     * @return {boolean?}
     */
    this.isAllowed = function (url, ua) {
        var rule = _self._getRule(url, ua);

        if (typeof rule === 'undefined') {
            return;
        }

        return !rule || rule.allow;
    };


    this._getRule = function (url, ua) {
        var parsedUrl = parseUrl(url) || {};
        var userAgent = formatUserAgent(ua || '*');

        parsedUrl.port = parsedUrl.port || '80';

        // The base URL must match otherwise this robots.txt is not valid for it.
        if (parsedUrl.protocol !== this._url.protocol ||
                parsedUrl.hostname !== this._url.hostname ||
                parsedUrl.port !== this._url.port) {
            return;
        }

        var rules = _self._rules[userAgent] || _self._rules['*'] || [];
        var path = urlEncodeToUpper(parsedUrl.pathname + parsedUrl.search)
        var rule = findRule(path, rules);

        return rule;
    };

    /**
     * Returns if a pattern is allowed by the specified rules.
     *
     * @param  {string}  path
     * @param  {Array.<Object>}  rules
     * @return {Object?}
     * @private
     */
    function findRule(path, rules) {
        var matchingRule = null;

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            if (typeof rule.pattern === 'string') {
                if (path.indexOf(rule.pattern) !== 0) {
                    continue;
                }

                // The longest matching rule takes precedence
                if (!matchingRule || rule.pattern.length > matchingRule.pattern.length) {
                    matchingRule = rule;
                }
                // The first matching pattern takes precedence
                // over all other rules including other patterns
            } else if (rule.pattern.test(path)) {
                return rule;
            }
        }

        return matchingRule;
    }
    
    parseRobots(contents || '');
};var plerdy_scroll_cache = ['10'];
var plerdy_scroll_cache_send = [];
var plerdy_scroll_dataOLD = ['10'];
var plerdy_scroll_data = 10;
var plerdy_on_off_send_scroll = 1;
var send_data = {};
if( _suid == 15121){

}else{
    (function (window) {
        'use strict';

        /*
         * Each function borrowed from:
         * jQuery 1.10.1
         * http://jquery.com/
         */
        function each(object, callback) {
            var name;

            for (name in object) {
                if (object.hasOwnProperty(name) && callback.call(object[name], name, object[name]) === false) {
                    break;
                }
            }
        }

        /*
         * Throttle function borrowed from:
         * Underscore.js 1.5.2
         * http://underscorejs.org
         * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
         * Underscore may be freely distributed under the MIT license.
         */
        function throttle(func, wait) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            var later = function () {
                previous = new Date;
                timeout = null;
                result = func.apply(context, args);
            };
            return function () {
                var now = new Date;
                if (!previous) {
                    previous = now;
                }
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        }

        function calculatePercentages(docHeight) {
            return {
                '20': parseInt(docHeight * 0.2, 10),
                '30': parseInt(docHeight * 0.3, 10),
                '40': parseInt(docHeight * 0.4, 10),
                '50': parseInt(docHeight * 0.5, 10),
                '60': parseInt(docHeight * 0.6, 10),
                '70': parseInt(docHeight * 0.7, 10),
                '80': parseInt(docHeight * 0.8, 10),
                '90': parseInt(docHeight * 0.9, 10),
                // 1px cushion to trigger 100% event in iOS
                '100': docHeight - 5
            };
        }

        function checkPercentages(percentages, scrollDistance) {
            each(percentages, function (key, val) {
                if (inArray(key, plerdy_scroll_cache) === -1 && scrollDistance >= val) {
                    if (on_off_mode_show * 1 === 1) {
                        //
                    }else{
                        plerdy_scroll_cache.push(key);
                        plerdy_scroll_data = key;
                        if(key*1 === 100){
                            sendDataScroll(true,key);
                        }
                    }
                }
            });
        }
        
        if(object.getCookieLocal('stopRequest')*1 !== 1 && object.getCookieLocal('stopCollectClicks')*1 !== 1){
            if(location.host.indexOf('competera') > -1){
                var typeS = 'wheel';
            }else{
                var typeS = 'scroll';
            }

            if(location.host.indexOf('evnedev.com') > -1){
                setTimeout(function (){
                    var elPl = document.querySelector(".content-scroll-wrapper.accelerated-scroll");
                    if(elPl) {
                        try {
                            elPl.addEventListener(typeS, throttle(function () {
                                //console.log(333);
                                if (window.performance && performance.navigation.type * 1 === 0) {
                                    //console.log(444);
                                    var
                                        docHeight = Math.max(elPl.scrollHeight, elPl.offsetHeight, elPl.clientHeight, elPl.scrollHeight, elPl.offsetHeight),
                                        winHeight = elPl.innerHeight || elPl.clientHeight,
                                        scrollTop = elPl.scrollTop || elPl.scrollTop,
                                        // recalculate percentages on every scroll
                                        percentages = calculatePercentages(docHeight),
                                        // see how far we've scrolled
                                        scrollDistance = scrollTop + winHeight;

                                    // if we've fired off all percentages, then return
                                    if (plerdy_scroll_cache.length >= 10) {
                                        return;
                                    }
                                    //console.log(scrollDistance);
                                    // check for percentage scrolled and see if it matches any of our percentages
                                    checkPercentages(percentages, scrollDistance);
                                }
                            }, 200));
                        }catch (e) {
                            //console.log(e);
                        }
                    }
                },2500);
            }else {
                window.addEventListener(typeS,
                    throttle(function () {
                        if (window.performance && performance.navigation.type * 1 === 0) {
                            /*
                             * We calculate document and window height on each scroll event to
                             * account for dynamic DOM changes.
                             */

                            var body = document.body,
                                html = document.documentElement,
                                docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
                                winHeight = window.innerHeight || html.clientHeight,
                                scrollTop = body.scrollTop || html.scrollTop,
                                // recalculate percentages on every scroll
                                percentages = calculatePercentages(docHeight),
                                // see how far we've scrolled
                                scrollDistance = scrollTop + winHeight;

                            // if we've fired off all percentages, then return
                            if (plerdy_scroll_cache.length >= 10) {
                                return;
                            }

                            // check for percentage scrolled and see if it matches any of our percentages
                            checkPercentages(percentages, scrollDistance);
                        }
                    }, 200)
                );
            }
        }

    }(window));
}
function sendDataScroll(async, key){
    if(window.plerdyDetectWrongCountry && window.plerdyDetectWrongCountry*1 === 1){
        return;
    }
    if (async === undefined) {
        async = true;
    }
    if (key === undefined) {
        key = 0;
    }
    if(object.getCookieLocal('stopRequest')*1 !== 1){
        if(plerdy_scroll_data*1>0 || (async === false && plerdy_scroll_data*1>0) || (key*1 === 100 && plerdy_scroll_data*1>0) ){
            send_data.user_hash = _site_hash_code;
            send_data.device = object.properties.device;
            send_data.suid = _suid;
            if(plerdy_config.traffic_source){
                send_data.traffic_source = plerdy_config.traffic_source;
            }else if(object.properties.traffic_source){
                send_data.traffic_source = object.properties.traffic_source;
            }else{
                send_data.traffic_source = 'direct';
            }
            send_data.plerdy_scroll_data = plerdy_scroll_data + '';
            send_data.unique_sessions = plerdy_config.first_visit
            if(plerdy_config.id_page){
                send_data.id_page = plerdy_config.id_page;
            }else{
                send_data.id_page = object.getCookieLocal('id_page');
            }
            send_data.trigger_id = window.plerdy_send_user_group?window.plerdy_send_user_group:0;
            if(window.country_code_plerdy){
                send_data.country_code_plerdy = window.country_code_plerdy;
            }else{
                send_data.country_code_plerdy = '';
            }
            send_data.user_ses = sesNamePuserSes;
            send_data.site_url = object.get_domain(object.properties.page_url);
            var params = encodeURIComponent(JSON.stringify(send_data, null, 2));
            if (object.properties.plerdy_url == 'https://test.plerdy.com/click/') {
                var url = plerdy_config.plerdy_url_save_test + 'send_scroll';
            }else{
                var url = plerdy_config.plerdy_url_save + 'send_scroll';
            }
            if(send_data.id_page*1 > 0){
                if(plerdy_on_off_send_scroll && plerdy_scroll_cache_send*1 < plerdy_scroll_data*1){
                    object.sendpost(url, 'application/json', function(){
                        send_data = {};
                        plerdy_scroll_cache_send = plerdy_scroll_data;
                        if(plerdy_scroll_data*1 !== 100){
                            plerdy_scroll_data = 10;
                            plerdy_scroll_cache = ['10'];
                        }else{
                            plerdy_on_off_send_scroll = 0;
                        }
                    }, async, 'params='+params);
                }
            }
        }
    }
}
;function doSeo(w,tracker) {
    if (tracker === undefined) {
        tracker = false;
    }
    var resLat = [];
    var resCyr = [];
    w.forEach(function (item) {
        if(tracker){
            var word = item[0].replace(/\u200B/g,'').replace(/'/g,'').replace(/#/g,'').replace(/"/g,'').replace(/”/g,'').replace('послідовності','').replace('й','й').trim();
        }else{
            var word = item['new']['w'].replace(/\u200B/g,'').replace(/'/g,'').replace(/#/g,'').replace(/"/g,'').replace(/”/g,'').replace('послідовності','').replace('й','й').trim();
        }
        var wDashArr = word.split('-');
        if(wDashArr.length > 1 && wDashArr[0] && wDashArr[0].length > 1 && wDashArr[1] && wDashArr[1].length > 1 ){
            //
        }else{
            var res = detect(word, '');
            var cyrCnt = res[0];
            var latCnt = res[1];

            if (latCnt > cyrCnt) {
                if(cyrCnt*1 !==0 && latCnt !== 0){
                    var res = detect(word, 'lat');
                    resLat.push([res[2], cyrCnt, latCnt]);
                }
                //console.log(word, 'lat', cyrCnt, latCnt);
            } else {
                if(cyrCnt*1 !==0 && latCnt !== 0){
                    var res = detect(word, 'cyr');
                    resCyr.push([res[2], cyrCnt, latCnt]);
                }
                //console.log(word, 'cyr', cyrCnt, latCnt);
            }
        }
    });
    if(resLat.length*1 === 0 && resCyr.length*1 === 0){
//        document.querySelectorAll('.word_errors').forEach(function(item){
//            item.style.display = 'none';
//        })
//        document.querySelector('#menu2 > div.word_errors.table-v1 > div.tr').style.display = 'none';
//        document.querySelector('#forWrap').innerHTML = 'No data';
    }else{
        if(tracker){
            return [resLat,resCyr]
        }else{
            addInPage(resLat, 'Latin');
            addInPage(resCyr, 'Cyrilic');
        }
    }
}
function addInPage(resS, lang) {
    resS.forEach(function (res) {
        var el = document.querySelector('div.for' + 'Latin' + ':last-child');
        document.querySelector('#for' + '' + 'Wrap').appendChild(el.cloneNode(true));

        el.querySelector('div:first-child').innerHTML = res[0];
        el.querySelector('div:nth-child(2)').innerHTML = lang;
//        el.querySelector('div:nth-child(2)').innerHTML = res[2];
//        el.querySelector('div:nth-child(3)').innerHTML = res[1];
        if (lang == "Latin") {
            if (res[1] * 1 === 0) {
                if(el.querySelector('.v-ico-ok')){
                    el.querySelector('.v-ico-ok').style.display = 'inline';
                }
                if(el.querySelector('.v-ico-no')){
                    el.querySelector('.v-ico-no').style.display = 'none';
                }

            } else {
                if(el.querySelector('.v-ico-ok')){
                    el.querySelector('.v-ico-ok').style.display = 'none';
                }
                if(el.querySelector('.v-ico-no')){
                    el.querySelector('.v-ico-no').style.display = 'inline';
                }
            }
        }
        if (lang == "Cyrilic") {
            if (res[2] * 1 === 0) {
                if(el.querySelector('.v-ico-ok')){
                    el.querySelector('.v-ico-ok').style.display = 'inline';
                }
                if(el.querySelector('.v-ico-no')){
                    el.querySelector('.v-ico-no').style.display = 'none';
                }
            } else {
                if(el.querySelector('.v-ico-ok')){
                    el.querySelector('.v-ico-ok').style.display = 'none';
                }
                if(el.querySelector('.v-ico-no')){
                    el.querySelector('.v-ico-no').style.display = 'inline';
                }
            }
        }
    })
}

function detect(word, replace) {
    var cyrCnt = 0;
    var latCnt = 0;
    var word2 = '';
    for (let i = 0; i < word.length; i++) {
        var sym = word[i].trim();
        if (replace) {
            if(sym !== "_") {
                if (/[\u0410-\u044f\u0401\u0451\u0406\u0456\u0407\u0457\u0404\u0454\u040b]/.test(sym)) {
                    if (replace === 'lat' && sym && isNaN(sym * 1) && sym !== "," && sym !== "'" && sym !== "’") {
                        word2 = word2 + "<span class='red_s'>" + sym + "</span>";
                    } else {
                        word2 = word2 + sym;
                    }
                } else {
                    if (replace === 'cyr' && sym && isNaN(sym * 1) && sym !== "," && sym !== "'" && sym !== "’") {
                        word2 = word2 + "<span class='red_s'>" + sym + "</span>";
                    } else {
                        word2 = word2 + sym;
                    }
                }
            }
        } else {
            if (sym && isNaN(sym * 1) && sym !== "," && sym !== "'" && sym !== "’") {
                try{
                    if (/[\u0410-\u044f\u0401\u0451\u0406\u0456\u0407\u0457\u0404\u0454\u040b]/.test(sym)) {
                        cyrCnt = cyrCnt * 1 + 1;
                    } else {
                        latCnt = latCnt * 1 + 1;
                    }                      
                }catch(e){
                    //
                }
            }
        }
    }
    return [cyrCnt, latCnt, word2.replace(/,/g, ', ')];
}
;function makrPlerdyReal(words2, dataParams) {
    (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
                (global.Mark = factory());
    }(this, (function () {
        'use strict';

        function _typeof(obj) {
            if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                _typeof = function (obj) {
                    return typeof obj;
                };
            } else {
                _typeof = function (obj) {
                    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
                };
            }

            return _typeof(obj);
        }

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }

        function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps) _defineProperties(Constructor.prototype, protoProps);
            if (staticProps) _defineProperties(Constructor, staticProps);
            return Constructor;
        }

        function _extends() {
            _extends = Object.assign || function (target) {
                for (var i = 1; i < arguments.length; i++) {
                    var source = arguments[i];

                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }

                return target;
            };

            return _extends.apply(this, arguments);
        }

        var DOMIterator =
            /*#__PURE__*/
            function () {
                function DOMIterator(ctx) {
                    var iframes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
                    var exclude = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
                    var iframesTimeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5000;

                    _classCallCheck(this, DOMIterator);

                    this.ctx = ctx;
                    this.iframes = iframes;
                    this.exclude = exclude;
                    this.iframesTimeout = iframesTimeout;
                }

                _createClass(DOMIterator, [{
                    key: "getContexts",
                    value: function getContexts() {
                        var ctx,
                            filteredCtx = [];

                        if (typeof this.ctx === 'undefined' || !this.ctx) {
                            ctx = [];
                        } else if (NodeList.prototype.isPrototypeOf(this.ctx)) {
                            ctx = Array.prototype.slice.call(this.ctx);
                        } else if (Array.isArray(this.ctx)) {
                            ctx = this.ctx;
                        } else if (typeof this.ctx === 'string') {
                            ctx = Array.prototype.slice.call(document.querySelectorAll(this.ctx));
                        } else {
                            ctx = [this.ctx];
                        }

                        ctx.forEach(function (ctx) {
                            try {
                                var isDescendant = filteredCtx.filter(function (contexts) {
                                    return contexts.contains(ctx);
                                }).length > 0;
                            }catch (e) {
                                var isDescendant = false;
                            }

                            if (filteredCtx.indexOf(ctx) === -1 && !isDescendant) {
                                filteredCtx.push(ctx);
                            }
                        });
                        return filteredCtx;
                    }
                }, {
                    key: "getIframeContents",
                    value: function getIframeContents(ifr, successFn) {
                        var errorFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
                        };
                        var doc;

                        try {
                            var ifrWin = ifr.contentWindow;
                            doc = ifrWin.document;

                            if (!ifrWin || !doc) {
                                throw new Error('iframe inaccessible');
                            }
                        } catch (e) {
                            errorFn();
                        }

                        if (doc) {
                            successFn(doc);
                        }
                    }
                }, {
                    key: "isIframeBlank",
                    value: function isIframeBlank(ifr) {
                        var bl = 'about:blank',
                            src = ifr.getAttribute('src').trim(),
                            href = ifr.contentWindow.location.href;
                        return href === bl && src !== bl && src;
                    }
                }, {
                    key: "observeIframeLoad",
                    value: function observeIframeLoad(ifr, successFn, errorFn) {
                        var _this = this;

                        var called = false,
                            tout = null;

                        var listener = function listener() {
                            if (called) {
                                return;
                            }

                            called = true;
                            clearTimeout(tout);

                            try {
                                if (!_this.isIframeBlank(ifr)) {
                                    ifr.removeEventListener('load', listener);

                                    _this.getIframeContents(ifr, successFn, errorFn);
                                }
                            } catch (e) {
                                errorFn();
                            }
                        };

                        ifr.addEventListener('load', listener);
                        tout = setTimeout(listener, this.iframesTimeout);
                    }
                }, {
                    key: "onIframeReady",
                    value: function onIframeReady(ifr, successFn, errorFn) {
                        try {
                            if (ifr.contentWindow.document.readyState === 'complete') {
                                if (this.isIframeBlank(ifr)) {
                                    this.observeIframeLoad(ifr, successFn, errorFn);
                                } else {
                                    this.getIframeContents(ifr, successFn, errorFn);
                                }
                            } else {
                                this.observeIframeLoad(ifr, successFn, errorFn);
                            }
                        } catch (e) {
                            errorFn();
                        }
                    }
                }, {
                    key: "waitForIframes",
                    value: function waitForIframes(ctx, done) {
                        var _this2 = this;

                        var eachCalled = 0;
                        this.forEachIframe(ctx, function () {
                            return true;
                        }, function (ifr) {
                            eachCalled++;

                            _this2.waitForIframes(ifr.querySelector('html'), function () {
                                if (!--eachCalled) {
                                    done();
                                }
                            });
                        }, function (handled) {
                            if (!handled) {
                                done();
                            }
                        });
                    }
                }, {
                    key: "forEachIframe",
                    value: function forEachIframe(ctx, filter, each) {
                        var _this3 = this;

                        var end = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {
                        };
                        var ifr = ctx.querySelectorAll('iframe'),
                            open = ifr.length,
                            handled = 0;
                        ifr = Array.prototype.slice.call(ifr);

                        var checkEnd = function checkEnd() {
                            if (--open <= 0) {
                                end(handled);
                            }
                        };

                        if (!open) {
                            checkEnd();
                        }

                        ifr.forEach(function (ifr) {
                            if (DOMIterator.matches(ifr, _this3.exclude)) {
                                checkEnd();
                            } else {
                                _this3.onIframeReady(ifr, function (con) {
                                    if (filter(ifr)) {
                                        handled++;
                                        each(con);
                                    }

                                    checkEnd();
                                }, checkEnd);
                            }
                        });
                    }
                }, {
                    key: "createIterator",
                    value: function createIterator(ctx, whatToShow, filter) {
                        return document.createNodeIterator(ctx, whatToShow, filter, false);
                    }
                }, {
                    key: "createInstanceOnIframe",
                    value: function createInstanceOnIframe(contents) {
                        return new DOMIterator(contents.querySelector('html'), this.iframes);
                    }
                }, {
                    key: "compareNodeIframe",
                    value: function compareNodeIframe(node, prevNode, ifr) {
                        var compCurr = node.compareDocumentPosition(ifr),
                            prev = Node.DOCUMENT_POSITION_PRECEDING;

                        if (compCurr & prev) {
                            if (prevNode !== null) {
                                var compPrev = prevNode.compareDocumentPosition(ifr),
                                    after = Node.DOCUMENT_POSITION_FOLLOWING;

                                if (compPrev & after) {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        }

                        return false;
                    }
                }, {
                    key: "getIteratorNode",
                    value: function getIteratorNode(itr) {
                        var prevNode = itr.previousNode();
                        var node;

                        if (prevNode === null) {
                            try {
                                node = itr.nextNode();
                            }catch (e) {

                            }
                        } else {
                            node = itr.nextNode() && itr.nextNode();
                        }

                        return {
                            prevNode: prevNode,
                            node: node
                        };
                    }
                }, {
                    key: "checkIframeFilter",
                    value: function checkIframeFilter(node, prevNode, currIfr, ifr) {
                        var key = false,
                            handled = false;
                        ifr.forEach(function (ifrDict, i) {
                            if (ifrDict.val === currIfr) {
                                key = i;
                                handled = ifrDict.handled;
                            }
                        });

                        if (this.compareNodeIframe(node, prevNode, currIfr)) {
                            if (key === false && !handled) {
                                ifr.push({
                                    val: currIfr,
                                    handled: true
                                });
                            } else if (key !== false && !handled) {
                                ifr[key].handled = true;
                            }

                            return true;
                        }

                        if (key === false) {
                            ifr.push({
                                val: currIfr,
                                handled: false
                            });
                        }

                        return false;
                    }
                }, {
                    key: "handleOpenIframes",
                    value: function handleOpenIframes(ifr, whatToShow, eCb, fCb) {
                        var _this4 = this;

                        ifr.forEach(function (ifrDict) {
                            if (!ifrDict.handled) {
                                _this4.getIframeContents(ifrDict.val, function (con) {
                                    _this4.createInstanceOnIframe(con).forEachNode(whatToShow, eCb, fCb);
                                });
                            }
                        });
                    }
                }, {
                    key: "iterateThroughNodes",
                    value: function iterateThroughNodes(whatToShow, ctx, eachCb, filterCb, doneCb) {
                        var _this5 = this;

                        var itr = this.createIterator(ctx, whatToShow, filterCb);

                        var ifr = [],
                            elements = [],
                            node,
                            prevNode,
                            retrieveNodes = function retrieveNodes() {
                                var _this5$getIteratorNod = _this5.getIteratorNode(itr);

                                prevNode = _this5$getIteratorNod.prevNode;
                                node = _this5$getIteratorNod.node;
                                return node;
                            };

                        while (retrieveNodes()) {
                            if (this.iframes) {
                                this.forEachIframe(ctx, function (currIfr) {
                                    return _this5.checkIframeFilter(node, prevNode, currIfr, ifr);
                                }, function (con) {
                                    _this5.createInstanceOnIframe(con).forEachNode(whatToShow, function (ifrNode) {
                                        return elements.push(ifrNode);
                                    }, filterCb);
                                });
                            }

                            elements.push(node);
                        }

                        elements.forEach(function (node) {
                            eachCb(node);
                        });

                        if (this.iframes) {
                            this.handleOpenIframes(ifr, whatToShow, eachCb, filterCb);
                        }

                        doneCb();
                    }
                }, {
                    key: "forEachNode",
                    value: function forEachNode(whatToShow, each, filter) {
                        var _this6 = this;

                        var done = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {
                        };
                        var contexts = this.getContexts();
                        var open = contexts.length;

                        if (!open) {
                            done();
                        }

                        contexts.forEach(function (ctx) {
                            var ready = function ready() {
                                _this6.iterateThroughNodes(whatToShow, ctx, each, filter, function () {
                                    if (--open <= 0) {
                                        done();
                                    }
                                });
                            };

                            if (_this6.iframes) {
                                _this6.waitForIframes(ctx, ready);
                            } else {
                                ready();
                            }
                        });
                    }
                }], [{
                    key: "matches",
                    value: function matches(element, selector) {
                        var selectors = typeof selector === 'string' ? [selector] : selector,
                            fn = element.matches || element.matchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector;

                        if (fn) {
                            var match = false;
                            selectors.every(function (sel) {
                                if (fn.call(element, sel)) {
                                    match = true;
                                    return false;
                                }

                                return true;
                            });
                            return match;
                        } else {
                            return false;
                        }
                    }
                }]);

                return DOMIterator;
            }();

        var RegExpCreator =
            /*#__PURE__*/
            function () {
                function RegExpCreator(options) {
                    _classCallCheck(this, RegExpCreator);

                    this.opt = _extends({}, {
                        'diacritics': true,
                        'synonyms': {},
                        'accuracy': 'partially',
                        'caseSensitive': false,
                        'ignoreJoiners': false,
                        'ignorePunctuation': [],
                        'wildcards': 'disabled'
                    }, options);
                }

                _createClass(RegExpCreator, [{
                    key: "create",
                    value: function create(str) {
                        if (this.opt.wildcards !== 'disabled') {
                            str = this.setupWildcardsRegExp(str);
                        }

                        str = this.escapeStr(str);

                        if (Object.keys(this.opt.synonyms).length) {
                            str = this.createSynonymsRegExp(str);
                        }

                        if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
                            str = this.setupIgnoreJoinersRegExp(str);
                        }

                        if (this.opt.diacritics) {
                            str = this.createDiacriticsRegExp(str);
                        }

                        str = this.createMergedBlanksRegExp(str);

                        if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
                            str = this.createJoinersRegExp(str);
                        }

                        if (this.opt.wildcards !== 'disabled') {
                            str = this.createWildcardsRegExp(str);
                        }

                        str = this.createAccuracyRegExp(str);
                        try {
                            var returnData = new RegExp(str, "gm".concat(this.opt.caseSensitive ? '' : 'i'));
                        }catch (e) {
                            var returnData = false;
                        }

                        return  returnData;
                    }
                }, {
                    key: "sortByLength",
                    value: function sortByLength(arry) {
                        return arry.sort(function (a, b) {
                            return a.length === b.length ? a > b ? 1 : -1 : b.length - a.length;
                        });
                    }
                }, {
                    key: "escapeStr",
                    value: function escapeStr(str) {
                        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
                    }
                }, {
                    key: "createSynonymsRegExp",
                    value: function createSynonymsRegExp(str) {
                        var _this = this;

                        var syn = this.opt.synonyms,
                            sens = this.opt.caseSensitive ? '' : 'i',
                            joinerPlaceholder = this.opt.ignoreJoiners || this.opt.ignorePunctuation.length ? "\0" : '';

                        for (var index in syn) {
                            if (syn.hasOwnProperty(index)) {
                                var keys = Array.isArray(syn[index]) ? syn[index] : [syn[index]];
                                keys.unshift(index);
                                keys = this.sortByLength(keys).map(function (key) {
                                    if (_this.opt.wildcards !== 'disabled') {
                                        key = _this.setupWildcardsRegExp(key);
                                    }

                                    key = _this.escapeStr(key);
                                    return key;
                                }).filter(function (k) {
                                    return k !== '';
                                });

                                if (keys.length > 1) {
                                    str = str.replace(new RegExp("(".concat(keys.map(function (k) {
                                        return _this.escapeStr(k);
                                    }).join('|'), ")"), "gm".concat(sens)), joinerPlaceholder + "(".concat(keys.map(function (k) {
                                        return _this.processSynonyms(k);
                                    }).join('|'), ")") + joinerPlaceholder);
                                }
                            }
                        }

                        return str;
                    }
                }, {
                    key: "processSynonyms",
                    value: function processSynonyms(str) {
                        if (this.opt.ignoreJoiners || this.opt.ignorePunctuation.length) {
                            str = this.setupIgnoreJoinersRegExp(str);
                        }

                        return str;
                    }
                }, {
                    key: "setupWildcardsRegExp",
                    value: function setupWildcardsRegExp(str) {
                        str = str.replace(/(?:\\)*\?/g, function (val) {
                            return val.charAt(0) === '\\' ? '?' : "\x01";
                        });
                        return str.replace(/(?:\\)*\*/g, function (val) {
                            return val.charAt(0) === '\\' ? '*' : "\x02";
                        });
                    }
                }, {
                    key: "createWildcardsRegExp",
                    value: function createWildcardsRegExp(str) {
                        var spaces = this.opt.wildcards === 'withSpaces';
                        return str.replace(/\u0001/g, spaces ? '[\\S\\s]?' : '\\S?').replace(/\u0002/g, spaces ? '[\\S\\s]*?' : '\\S*');
                    }
                }, {
                    key: "setupIgnoreJoinersRegExp",
                    value: function setupIgnoreJoinersRegExp(str) {
                        return str.replace(/[^(|)\\]/g, function (val, indx, original) {
                            var nextChar = original.charAt(indx + 1);

                            if (/[(|)\\]/.test(nextChar) || nextChar === '') {
                                return val;
                            } else {
                                return val + "\0";
                            }
                        });
                    }
                }, {
                    key: "createJoinersRegExp",
                    value: function createJoinersRegExp(str) {
                        var joiner = [];
                        var ignorePunctuation = this.opt.ignorePunctuation;

                        if (Array.isArray(ignorePunctuation) && ignorePunctuation.length) {
                            joiner.push(this.escapeStr(ignorePunctuation.join('')));
                        }

                        if (this.opt.ignoreJoiners) {
                            joiner.push("\\u00ad\\u200b\\u200c\\u200d");
                        }

                        return joiner.length ? str.split(/\u0000+/).join("[".concat(joiner.join(''), "]*")) : str;
                    }
                }, {
                    key: "createDiacriticsRegExp",
                    value: function createDiacriticsRegExp(str) {
                        var sens = this.opt.caseSensitive ? '' : 'i',
                            dct = this.opt.caseSensitive ? ['aàáảãạăằắẳẵặâầấẩẫậäåāą', 'AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćč', 'CÇĆČ', 'dđď', 'DĐĎ', 'eèéẻẽẹêềếểễệëěēę', 'EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ', 'iìíỉĩịîïī', 'IÌÍỈĨỊÎÏĪ', 'lł', 'LŁ', 'nñňń', 'NÑŇŃ', 'oòóỏõọôồốổỗộơởỡớờợöøō', 'OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rř', 'RŘ', 'sšśșş', 'SŠŚȘŞ', 'tťțţ', 'TŤȚŢ', 'uùúủũụưừứửữựûüůū', 'UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿ', 'YÝỲỶỸỴŸ', 'zžżź', 'ZŽŻŹ'] : ['aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ', 'cçćčCÇĆČ', 'dđďDĐĎ', 'eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ', 'iìíỉĩịîïīIÌÍỈĨỊÎÏĪ', 'lłLŁ', 'nñňńNÑŇŃ', 'oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ', 'rřRŘ', 'sšśșşSŠŚȘŞ', 'tťțţTŤȚŢ', 'uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ', 'yýỳỷỹỵÿYÝỲỶỸỴŸ', 'zžżźZŽŻŹ'];
                        var handled = [];
                        str.split('').forEach(function (ch) {
                            dct.every(function (dct) {
                                if (dct.indexOf(ch) !== -1) {
                                    if (handled.indexOf(dct) > -1) {
                                        return false;
                                    }

                                    str = str.replace(new RegExp("[".concat(dct, "]"), "gm".concat(sens)), "[".concat(dct, "]"));
                                    handled.push(dct);
                                }

                                return true;
                            });
                        });
                        return str;
                    }
                }, {
                    key: "createMergedBlanksRegExp",
                    value: function createMergedBlanksRegExp(str) {
                        return str.replace(/[\s]+/gmi, '[\\s]+');
                    }
                }, {
                    key: "createAccuracyRegExp",
                    value: function createAccuracyRegExp(str) {
                        var _this2 = this;

                        var chars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~¡¿';
                        var acc = this.opt.accuracy,
                            val = typeof acc === 'string' ? acc : acc.value,
                            ls = typeof acc === 'string' ? [] : acc.limiters,
                            lsJoin = '';
                        ls.forEach(function (limiter) {
                            lsJoin += "|".concat(_this2.escapeStr(limiter));
                        });

                        switch (val) {
                            case 'partially':
                            default:
                                return "()(".concat(str, ")");

                            case 'complementary':
                                lsJoin = '\\s' + (lsJoin ? lsJoin : this.escapeStr(chars));
                                return "()([^".concat(lsJoin, "]*").concat(str, "[^").concat(lsJoin, "]*)");

                            case 'exactly':
                                return "(^|\\s".concat(lsJoin, ")(").concat(str, ")(?=$|\\s").concat(lsJoin, ")");
                        }
                    }
                }]);

                return RegExpCreator;
            }();

        var Mark =
            /*#__PURE__*/
            function () {
                function Mark(ctx) {
                    _classCallCheck(this, Mark);

                    this.ctx = ctx;
                    this.ie = false;
                    var ua = window.navigator.userAgent;

                    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
                        this.ie = true;
                    }
                }

                _createClass(Mark, [{
                    key: "log",
                    value: function log(msg) {
                        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'debug';
                        var log = this.opt.log;

                        if (!this.opt.debug) {
                            return;
                        }

                        if (_typeof(log) === 'object' && typeof log[level] === 'function') {
                            log[level]("mark.js: ".concat(msg));
                        }
                    }
                }, {
                    key: "getSeparatedKeywords",
                    value: function getSeparatedKeywords(sv) {
                        var _this = this;

                        var stack = [];
                        sv.forEach(function (kw) {
                            if (!_this.opt.separateWordSearch) {
                                if (kw.trim() && stack.indexOf(kw) === -1) {
                                    stack.push(kw);
                                }
                            } else {
                                kw.split(' ').forEach(function (kwSplitted) {
                                    if (kwSplitted.trim() && stack.indexOf(kwSplitted) === -1) {
                                        stack.push(kwSplitted);
                                    }
                                });
                            }
                        });
                        return {
                            'keywords': stack.sort(function (a, b) {
                                return b.length - a.length;
                            }),
                            'length': stack.length
                        };
                    }
                }, {
                    key: "isNumeric",
                    value: function isNumeric(value) {
                        return Number(parseFloat(value)) == value;
                    }
                }, {
                    key: "checkRanges",
                    value: function checkRanges(array) {
                        var _this2 = this;

                        if (!Array.isArray(array) || Object.prototype.toString.call(array[0]) !== '[object Object]') {
                            this.log('markRanges() will only accept an array of objects');
                            this.opt.noMatch(array);
                            return [];
                        }

                        var stack = [];
                        var last = 0;
                        array.sort(function (a, b) {
                            return a.start - b.start;
                        }).forEach(function (item) {
                            var _this2$callNoMatchOnI = _this2.callNoMatchOnInvalidRanges(item, last),
                                start = _this2$callNoMatchOnI.start,
                                end = _this2$callNoMatchOnI.end,
                                valid = _this2$callNoMatchOnI.valid;

                            if (valid) {
                                item.start = start;
                                item.length = end - start;
                                stack.push(item);
                                last = end;
                            }
                        });
                        return stack;
                    }
                }, {
                    key: "callNoMatchOnInvalidRanges",
                    value: function callNoMatchOnInvalidRanges(range, last) {
                        var start,
                            end,
                            valid = false;

                        if (range && typeof range.start !== 'undefined') {
                            start = parseInt(range.start, 10);
                            end = start + parseInt(range.length, 10);

                            if (this.isNumeric(range.start) && this.isNumeric(range.length) && end - last > 0 && end - start > 0) {
                                valid = true;
                            } else {
                                this.log('Ignoring invalid or overlapping range: ' + "".concat(JSON.stringify(range)));
                                this.opt.noMatch(range);
                            }
                        } else {
                            this.log("Ignoring invalid range: ".concat(JSON.stringify(range)));
                            this.opt.noMatch(range);
                        }

                        return {
                            start: start,
                            end: end,
                            valid: valid
                        };
                    }
                }, {
                    key: "checkWhitespaceRanges",
                    value: function checkWhitespaceRanges(range, originalLength, string) {
                        var end,
                            valid = true,
                            max = string.length,
                            offset = originalLength - max,
                            start = parseInt(range.start, 10) - offset;
                        start = start > max ? max : start;
                        end = start + parseInt(range.length, 10);

                        if (end > max) {
                            end = max;
                            this.log("End range automatically set to the max value of ".concat(max));
                        }

                        if (start < 0 || end - start < 0 || start > max || end > max) {
                            valid = false;
                            this.log("Invalid range: ".concat(JSON.stringify(range)));
                            this.opt.noMatch(range);
                        } else if (string.substring(start, end).replace(/\s+/g, '') === '') {
                            valid = false;
                            this.log('Skipping whitespace only range: ' + JSON.stringify(range));
                            this.opt.noMatch(range);
                        }

                        return {
                            start: start,
                            end: end,
                            valid: valid
                        };
                    }
                }, {
                    key: "getTextNodes",
                    value: function getTextNodes(cb) {
                        var _this3 = this;

                        var val = '',
                            nodes = [];
                        this.iterator.forEachNode(NodeFilter.SHOW_TEXT, function (node) {
                            nodes.push({
                                start: val.length,
                                end: (val += node.textContent).length,
                                node: node
                            });
                        }, function (node) {
                            if (_this3.matchesExclude(node.parentNode)) {
                                return NodeFilter.FILTER_REJECT;
                            } else {
                                return NodeFilter.FILTER_ACCEPT;
                            }
                        }, function () {
                            try {
                                cb({
                                    value: val,
                                    nodes: nodes
                                });
                            }catch (e){
                                //
                            }
                        });
                    }
                }, {
                    key: "matchesExclude",
                    value: function matchesExclude(el) {
                        return DOMIterator.matches(el, this.opt.exclude.concat(['script', 'style', 'title', 'head', 'html']));
                    }
                }, {
                    key: "wrapRangeInTextNode",
                    value: function wrapRangeInTextNode(node, start, end) {
                        var hEl = !this.opt.element ? 'mark' : this.opt.element,
                            startNode = node.splitText(start),
                            ret = startNode.splitText(end - start);
                        var repl = document.createElement(hEl);
                        repl.setAttribute('data-markjs', 'true');

                        if (this.opt.className) {
                            repl.setAttribute('class', this.opt.className);
                        }

                        repl.textContent = startNode.textContent;
                        startNode.parentNode.replaceChild(repl, startNode);
                        return ret;
                    }
                }, {
                    key: "wrapRangeInMappedTextNode",
                    value: function wrapRangeInMappedTextNode(dict, start, end, filterCb, eachCb) {
                        var _this4 = this;

                        dict.nodes.every(function (n, i) {
                            var sibl = dict.nodes[i + 1];

                            if (typeof sibl === 'undefined' || sibl.start > start) {
                                if (!filterCb(n.node)) {
                                    return false;
                                }

                                var s = start - n.start,
                                    e = (end > n.end ? n.end : end) - n.start,
                                    startStr = dict.value.substr(0, n.start),
                                    endStr = dict.value.substr(e + n.start);
                                n.node = _this4.wrapRangeInTextNode(n.node, s, e);
                                dict.value = startStr + endStr;
                                dict.nodes.forEach(function (k, j) {
                                    if (j >= i) {
                                        if (dict.nodes[j].start > 0 && j !== i) {
                                            dict.nodes[j].start -= e;
                                        }

                                        dict.nodes[j].end -= e;
                                    }
                                });
                                end -= e;
                                eachCb(n.node.previousSibling, n.start);

                                if (end > n.end) {
                                    start = n.end;
                                } else {
                                    return false;
                                }
                            }

                            return true;
                        });
                    }
                }, {
                    key: "wrapGroups",
                    value: function wrapGroups(node, pos, len, eachCb) {
                        node = this.wrapRangeInTextNode(node, pos, pos + len);
                        eachCb(node.previousSibling);
                        return node;
                    }
                }, {
                    key: "separateGroups",
                    value: function separateGroups(node, match, matchIdx, filterCb, eachCb) {
                        var matchLen = match.length;

                        for (var i = 1; i < matchLen; i++) {
                            var pos = node.textContent.indexOf(match[i]);

                            if (match[i] && pos > -1 && filterCb(match[i], node)) {
                                node = this.wrapGroups(node, pos, match[i].length, eachCb);
                            }
                        }

                        return node;
                    }
                }, {
                    key: "wrapMatches",
                    value: function wrapMatches(regex, ignoreGroups, filterCb, eachCb, endCb) {
                        var _this5 = this;

                        var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
                        this.getTextNodes(function (dict) {
                            dict.nodes.forEach(function (node) {
                                node = node.node;
                                var match;

                                while ((match = regex.exec(node.textContent)) !== null && match[matchIdx] !== '') {
                                    if (_this5.opt.separateGroups) {
                                        node = _this5.separateGroups(node, match, matchIdx, filterCb, eachCb);
                                    } else {
                                        if (!filterCb(match[matchIdx], node)) {
                                            continue;
                                        }

                                        var pos = match.index;

                                        if (matchIdx !== 0) {
                                            for (var i = 1; i < matchIdx; i++) {
                                                pos += match[i].length;
                                            }
                                        }

                                        node = _this5.wrapGroups(node, pos, match[matchIdx].length, eachCb);
                                    }

                                    regex.lastIndex = 0;
                                }
                            });
                            endCb();
                        });
                    }
                }, {
                    key: "wrapMatchesAcrossElements",
                    value: function wrapMatchesAcrossElements(regex, ignoreGroups, filterCb, eachCb, endCb) {
                        var _this6 = this;

                        var matchIdx = ignoreGroups === 0 ? 0 : ignoreGroups + 1;
                        this.getTextNodes(function (dict) {
                            var match;

                            while ((match = regex.exec(dict.value)) !== null && match[matchIdx] !== '') {
                                var start = match.index;

                                if (matchIdx !== 0) {
                                    for (var i = 1; i < matchIdx; i++) {
                                        start += match[i].length;
                                    }
                                }

                                var end = start + match[matchIdx].length;

                                _this6.wrapRangeInMappedTextNode(dict, start, end, function (node) {
                                    return filterCb(match[matchIdx], node);
                                }, function (node, lastIndex) {
                                    regex.lastIndex = lastIndex;
                                    eachCb(node);
                                });
                            }

                            endCb();
                        });
                    }
                }, {
                    key: "wrapRangeFromIndex",
                    value: function wrapRangeFromIndex(ranges, filterCb, eachCb, endCb) {
                        var _this7 = this;

                        this.getTextNodes(function (dict) {
                            var originalLength = dict.value.length;
                            ranges.forEach(function (range, counter) {
                                var _this7$checkWhitespac = _this7.checkWhitespaceRanges(range, originalLength, dict.value),
                                    start = _this7$checkWhitespac.start,
                                    end = _this7$checkWhitespac.end,
                                    valid = _this7$checkWhitespac.valid;

                                if (valid) {
                                    _this7.wrapRangeInMappedTextNode(dict, start, end, function (node) {
                                        return filterCb(node, range, dict.value.substring(start, end), counter);
                                    }, function (node) {
                                        eachCb(node, range);
                                    });
                                }
                            });
                            endCb();
                        });
                    }
                }, {
                    key: "unwrapMatches",
                    value: function unwrapMatches(node) {
                        var parent = node.parentNode;
                        var docFrag = document.createDocumentFragment();

                        while (node.firstChild) {
                            docFrag.appendChild(node.removeChild(node.firstChild));
                        }

                        parent.replaceChild(docFrag, node);

                        if (!this.ie) {
                            parent.normalize();
                        } else {
                            this.normalizeTextNode(parent);
                        }
                    }
                }, {
                    key: "normalizeTextNode",
                    value: function normalizeTextNode(node) {
                        if (!node) {
                            return;
                        }

                        if (node.nodeType === 3) {
                            while (node.nextSibling && node.nextSibling.nodeType === 3) {
                                node.nodeValue += node.nextSibling.nodeValue;
                                node.parentNode.removeChild(node.nextSibling);
                            }
                        } else {
                            this.normalizeTextNode(node.firstChild);
                        }

                        this.normalizeTextNode(node.nextSibling);
                    }
                }, {
                    key: "markRegExp",
                    value: function markRegExp(regexp, opt) {
                        var _this8 = this;

                        this.opt = opt;
                        this.log("Searching with expression \"".concat(regexp, "\""));
                        var totalMatches = 0,
                            fn = 'wrapMatches';

                        var eachCb = function eachCb(element) {
                            totalMatches++;

                            _this8.opt.each(element);
                        };

                        if (this.opt.acrossElements) {
                            fn = 'wrapMatchesAcrossElements';
                        }

                        this[fn](regexp, this.opt.ignoreGroups, function (match, node) {
                            return _this8.opt.filter(node, match, totalMatches);
                        }, eachCb, function () {
                            if (totalMatches === 0) {
                                _this8.opt.noMatch(regexp);
                            }

                            _this8.opt.done(totalMatches);
                        });
                    }
                }, {
                    key: "mark",
                    value: function mark(sv, opt) {
                        var _this9 = this;

                        this.opt = opt;
                        var totalMatches = 0,
                            fn = 'wrapMatches';

                        var _this$getSeparatedKey = this.getSeparatedKeywords(typeof sv === 'string' ? [sv] : sv),
                            kwArr = _this$getSeparatedKey.keywords,
                            kwArrLen = _this$getSeparatedKey.length,
                            handler = function handler(kw) {
                                var regex = new RegExpCreator(_this9.opt).create(kw);
                                var matches = 0;

                                _this9.log("Searching with expression \"".concat(regex, "\""));

                                _this9[fn](regex, 1, function (term, node) {
                                    return _this9.opt.filter(node, kw, totalMatches, matches);
                                }, function (element) {
                                    matches++;
                                    totalMatches++;

                                    _this9.opt.each(element);
                                }, function () {
                                    if (matches === 0) {
                                        _this9.opt.noMatch(kw);
                                    }

                                    if (kwArr[kwArrLen - 1] === kw) {
                                        _this9.opt.done(totalMatches);
                                    } else {
                                        handler(kwArr[kwArr.indexOf(kw) + 1]);
                                    }
                                });
                            };

                        if (this.opt.acrossElements) {
                            fn = 'wrapMatchesAcrossElements';
                        }

                        if (kwArrLen === 0) {
                            this.opt.done(totalMatches);
                        } else {
                            handler(kwArr[0]);
                        }
                    }
                }, {
                    key: "markRanges",
                    value: function markRanges(rawRanges, opt) {
                        var _this10 = this;

                        this.opt = opt;
                        var totalMatches = 0,
                            ranges = this.checkRanges(rawRanges);

                        if (ranges && ranges.length) {
                            this.log('Starting to mark with the following ranges: ' + JSON.stringify(ranges));
                            this.wrapRangeFromIndex(ranges, function (node, range, match, counter) {
                                return _this10.opt.filter(node, range, match, counter);
                            }, function (element, range) {
                                totalMatches++;

                                _this10.opt.each(element, range);
                            }, function () {
                                _this10.opt.done(totalMatches);
                            });
                        } else {
                            this.opt.done(totalMatches);
                        }
                    }
                }, {
                    key: "unmark",
                    value: function unmark(opt) {
                        var _this11 = this;

                        this.opt = opt;
                        var sel = this.opt.element ? this.opt.element : '*';
                        sel += '[data-markjs]';

                        if (this.opt.className) {
                            sel += ".".concat(this.opt.className);
                        }

                        this.log("Removal selector \"".concat(sel, "\""));
                        this.iterator.forEachNode(NodeFilter.SHOW_ELEMENT, function (node) {
                            _this11.unwrapMatches(node);
                        }, function (node) {
                            var matchesSel = DOMIterator.matches(node, sel),
                                matchesExclude = _this11.matchesExclude(node);

                            if (!matchesSel || matchesExclude) {
                                return NodeFilter.FILTER_REJECT;
                            } else {
                                return NodeFilter.FILTER_ACCEPT;
                            }
                        }, this.opt.done);
                    }
                }, {
                    key: "opt",
                    set: function set(val) {
                        this._opt = _extends({}, {
                            'element': '',
                            'className': '',
                            'exclude': [],
                            'iframes': false,
                            'iframesTimeout': 5000,
                            'separateWordSearch': true,
                            'acrossElements': false,
                            'ignoreGroups': 0,
                            'each': function each() {
                            },
                            'noMatch': function noMatch() {
                            },
                            'filter': function filter() {
                                return true;
                            },
                            'done': function done() {
                            },
                            'debug': false,
                            'log': window.console
                        }, val);
                    },
                    get: function get() {
                        return this._opt;
                    }
                }, {
                    key: "iterator",
                    get: function get() {
                        return new DOMIterator(this.ctx, this.opt.iframes, this.opt.exclude, this.opt.iframesTimeout);
                    }
                }]);

                return Mark;
            }();

        function Mark$1(ctx) {
            var _this = this;

            var instance = new Mark(ctx);

            this.mark = function (sv, opt) {
                instance.mark(sv, opt);
                return _this;
            };

            this.markRegExp = function (sv, opt) {
                instance.markRegExp(sv, opt);
                return _this;
            };

            this.markRanges = function (sv, opt) {
                instance.markRanges(sv, opt);
                return _this;
            };

            this.unmark = function (opt) {
                instance.unmark(opt);
                return _this;
            };

            return this;
        }

        return Mark$1;

    })));

    var instance = '';
    var counters = {};

    var words3Keys = dataParams.words3Keys;
    if(dataParams.elementSelectorFormMark){
        var body = dataParams.elementSelectorFormMark;
    }else{
        var body = 'body';
    }

    var instance = new Mark(document.querySelector(body));

    var i,j, temporary, chunk = 100;
    for (i = 0,j = words2.length; i < j; i += chunk) {
        temporary = words2.slice(i, i + chunk);
        instance.mark(temporary, {
            'accuracy':'exactly',
            "separateWordSearch": dataParams.separateWordSearch,
            "diacritics": true,
            "className": "plerdy_class_mark " + dataParams.types,
            "each": function(node){
                if(dataParams.types === "top_unical") {
                    if(node.innerText) {
                        node.setAttribute('data-plerdy_unical_seo_cnt', words3Keys[node.innerText.toLowerCase()] ? words3Keys[node.innerText.toLowerCase()] : 0);
                    }else{
                        node.setAttribute('data-plerdy_unical_seo_cnt', words3Keys[node.innerHTML.toLowerCase()] ? words3Keys[node.innerHTML.toLowerCase()] : 0);
                    }
                }
                // node is the marked DOM element
            },
            "filter": function(textNode, foundTerm, totalCounter, counter){
                // textNode is the text node which contains the found term
                // foundTerm is the found search term
                // totalCounter is a counter indicating the total number of all marks
                //              at the time of the function call
                // counter is a counter indicating the number of marks for the found term
                if(counter > 0 && dataParams.types === "top_unical"){
                    return false;
                }else{
                    return true;
                }
                //return true; // must return either true or false
            },
        });
    }

    if(typeof addStyle_Plerdy === 'undefined'){
        function addStyle_Plerdy(css, i) {
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (i) {
                if (document.querySelector("[data-pl='" + i + "']")) {
                    head.removeChild(document.querySelector("[data-pl='" + i + "']"));
                }
                style.dataset.pl = i;
            }
            style.innerHTML = css;

            head.appendChild(style);
        }
    }
    addStyle_Plerdy('mark.plerdy_class_mark {padding:0; color: black; background:' + dataParams.color + ';}', 'p_s_w_top');
    setTimeout(function () {
        var data = {};
        data.type = 'eeeeeee';
        try {
            sendToIframe(data);
        }catch (e){

        }

        var plerdy_app_seo = document.querySelector("#plerdy_app_seo");
        if(plerdy_app_seo) {
            var dataObj = {};
            dataObj.function = "stop_preloader";
            plerdy_app_seo.contentWindow.postMessage(dataObj, "*");
        }
    }, 100);
}

function showMarkedSeoNum(target,e){
    if (target.dataset && target.dataset.plerdy_unical_seo_cnt) {
        var num = target.dataset.plerdy_unical_seo_cnt;
        var div = document.querySelector('#plerdy_show_on_mouse_hover');
        if (div){
            //
        } else {
            var div = document.createElement('div');
        }
        var leftP = e.pageX * 1;
        if(document.documentElement.clientWidth - leftP < 150){
            var leftP = (document.documentElement.clientWidth - 150);
        }
        var topP = e.pageY * 1 + 10;
        div.setAttribute('style', 'min-width:150px; line-height:16px; pointer-events:none; font-weight: 300; text-transform: none; z-index:999999999; display:block; text-align: left; position: absolute; background: rgba(0, 0, 0, 0.8); box-shadow: 0 0 18px -2px #666; padding: 3px 6px; color: white; font: 12px Arial;color:#fff; left:' + leftP + 'px; top:' + topP + 'px');
        div.setAttribute('id', 'plerdy_show_on_mouse_hover');

        div.innerHTML = 'Numer of this word is ' + num;
        document.querySelector('body').appendChild(div);
        var ell = document.querySelector('#plerdy_show_on_mouse_hover');
        if(ell){
            var st = getComputedStyle(ell);
            var hh = parseInt(st.height);
            if(document.documentElement.clientHeight - e.pageY < 0){
                ell.style.top = ((topP - hh)*1) + 'px';
            }
        }

    }
}


function plerdyUnMakrWords(){
    try {
        var instance = new Mark(document.querySelector("body"));
        instance.unmark();
    }catch(e){

    }
}
 
 };