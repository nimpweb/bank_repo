const searchElements = document.querySelectorAll('.search-input')
const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party'
const DADATA_APIKEY = '81a0a702e9215e47df7a30748feb0a7f50d02a4b'


const handleInput = async event => {
  const { value } = event.target
  const closeElement = event.target.closest('.search-input').querySelector('.clear')
  const searchInputLocal = event.target.closest('.search-input')
  const outputListLocal = searchInputLocal.querySelector('.output-container')
  
  closeElement.addEventListener('click', event => {
    searchInputLocal.querySelector('input').value = ''
    outputListLocal.classList.remove('active')
    outputListLocal.innerHTML = ''
    closeElement.classList.remove('active')
    searchInputLocal.querySelector('input').focus()
  })
  
  value.length ? closeElement.classList.add('active') : closeElement.classList.remove('active')

  if (value.length > 3) {
    const response = await fetch(DADATA_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Token " + DADATA_APIKEY
      },
      body: JSON.stringify({query: value})
    })
    if (response.ok) {
      const json = await response.json()
      console.log(json);
      let html = null;
      if (json.suggestions.length) {
        html = json.suggestions.map( item => 
          `<div class="search-element">
            <div class="title">${item.value}</div>
            <div class="subtitle">${item.data.inn}, ${item.data.address.value}</div>
          </div>`
        ).join('')
        html = `<div class="search-element__noselect">Выберите вариант или продолжите ввод</div>${html}`
      }
      outputListLocal.innerHTML = html
      document.querySelectorAll('.search-element').forEach(el => el.addEventListener('click', (event) => {
        searchInputLocal.querySelector('input').value = event.target.closest('.search-element').querySelector('.title').textContent
        outputListLocal.classList.remove('active')
      }))
      value.length ? outputListLocal.classList.add('active') : outputListLocal.classList.remove('active')
    }
  } else {
    outputListLocal.classList.remove('active')
  }
}

const debounceHandleInput = debounce(handleInput, 500)

searchElements.forEach(search => {
  search.querySelectorAll('input').forEach(el => {
    el.addEventListener('input', debounceHandleInput)
    el.addEventListener('blur', event => event.target.value.length ? event.target.classList.add('fill') : event.target.classList.remove('fill'))
  })
})

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.search-input').forEach(el => el.querySelectorAll('input').forEach(input => input.value.length ? input.classList.add('fill') : input.classList.remove('fill')))
})

document.addEventListener('click', event => {
  if (!event.target.closest('.search-input')) {
    document.querySelectorAll('.output-container').forEach(el => el.classList.remove('active'))
  }
})


function debounce(callback, delay) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  }
}
