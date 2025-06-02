const inputField = document.querySelector('input');
const ul = document.querySelector('ul');
const appMain = document.querySelector('.app');
const itemList = document.querySelector('.item-list');

function debounce(fn, debounceTime) {
	let timeOut = 0;

	return (...args) => {
        clearTimeout(timeOut);
        timeOut = setTimeout(() => {
            fn(...args);
        }, debounceTime)
    }
}

async function getRepositories(val) {
	try {
		const response = await fetch(`https://api.github.com/search/repositories?q=${val}`);

		if (!response.ok) {
			throw new Error('Network error: ' + response.status);
		}

		const data = await response.json();

		return data.items;
	} catch(error) {
		console.log('Error: ' + error.message)
	}
}

async function saveRepositories(val) {
	const repos = await getRepositories(val);
	const matches = [];

	if (val.trim() === '') {
    	ul.innerHTML = '';
    	return;
    }

    repos.forEach(el => {
    	if (el.name.startsWith(val.toLowerCase())) {
    		matches.push(el);
    	}
    });

    ul.innerHTML = '';

    const maxItems = 5;
	let itemsCount = 0;

    matches.forEach(el => {
    	const item = document.createElement('li');
		item.textContent = el.name;
		item.classList.add('suggestion-item');

		item.addEventListener('click', function() {
			inputField.value = '';
			ul.innerHTML = '';
			const listItem = document.createElement('li');
			const closeBtn = document.createElement('span');
			closeBtn.innerHTML = '&times;';
			closeBtn.classList.add('close-btn');
			listItem.classList.add('list-item');

			function createSpanWithNames(text) {
				const span = document.createElement('span');
        		span.textContent = text;
        		span.appendChild(document.createElement('br'));
        		return span;
			}

			const itemName = createSpanWithNames(el.name);
			const itemOwner = createSpanWithNames(el.owner.login);
			const itemStars = createSpanWithNames(el.stargazers_count);
			itemName.innerHTML = 'Name: ' + el.name + '<br>';
			itemOwner.innerHTML = 'Owner: ' + el.owner.login + '<br>';
			itemStars.innerHTML = 'Stars: ' + el.stargazers_count + '<br>';

			listItem.appendChild(itemName);
			listItem.appendChild(itemOwner);
			listItem.appendChild(itemStars);

			listItem.appendChild(closeBtn);
			itemList.appendChild(listItem);

			closeBtn.addEventListener('click', function(e) {
				e.stopPropagation();
				listItem.remove();
			});
		});

		function appendItems(item) {
			if (itemsCount < maxItems) {
				ul.appendChild(item);
				itemsCount++;
			}
		}

		appendItems(item);

		 });
}

const debouncedFn = debounce(saveRepositories, 300);

inputField.addEventListener('input', (e) => {
	debouncedFn(e.target.value);
});