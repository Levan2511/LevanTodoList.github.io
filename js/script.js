document.addEventListener('DOMContentLoaded', function() {
    const DOMElements = {
        mainWrapper: document.querySelector('.main-wrapper'),
        addBtn: document.querySelector('.add-item-btn'),
        closeBtn: document.querySelector('.closeBtn'),
        addItemInput: document.querySelector('.add-item-input'),
        showDoneBtn: document.querySelector('.show-completed-items'),
        itemsWrapper: document.getElementsByClassName('items-wrapper')[0],
        items: [],
        doneItemsText: []
    }
    DOMElements.items = localStorage
        .getItem('items') ? setItemsFromLocalStorage(DOMElements.itemsWrapper) : [];

    DOMElements.addBtn.addEventListener('click', function(event) {
        event.preventDefault();
        if (/^[\w-а-яё]+.*/gmi.test(DOMElements.addItemInput.value.trim())) {
            const itemAndInput = insertItemToList(DOMElements.addItemInput.value, DOMElements.itemsWrapper);
            DOMElements.items.push(itemAndInput[0]);

            let itemsArr = JSON.parse(localStorage.getItem('items'));
            // if localStorage has storage with name 'items'
            if (itemsArr) {
                itemsArr.push(itemAndInput[1].value);
                localStorage.setItem('items', JSON.stringify(itemsArr))
            } else {
                localStorage.setItem('items', JSON.stringify([itemAndInput[1].value]));
            }
        }
        DOMElements.addItemInput.value = '';
    });

    DOMElements.showDoneBtn.addEventListener('click', function(event) {
        event.preventDefault();
        showCompletedItems(DOMElements.doneItemsText, DOMElements.mainWrapper);
    });

    DOMElements.closeBtn.addEventListener('click', function(event) {
        DOMElements.mainWrapper.classList.remove('blur-effect');
        document.querySelector('.done-items-wrapper').classList.add('d-none');
        document.querySelector('.done-items-list').innerHTML = '';
    })
    
    DOMElements.itemsWrapper.addEventListener('click', function(event) {
        buttonFunctionality(DOMElements.items, event, DOMElements.doneItemsText);
    })
});

function buttonFunctionality(itemsArr, event, doneItemsTxt) {
    for (let i = 0; i < itemsArr.length; i++) {
        const input = itemsArr[i].querySelector('.item-input');
        const buttons = {
            done: itemsArr[i].querySelector('.done-btn'),
            doneIcon: itemsArr[i].querySelector('.fa-check'),
            edit: itemsArr[i].querySelector('.edit-btn'),
            editIcon: itemsArr[i].querySelector('.fa-edit'),
            delete: itemsArr[i].querySelector('.delete-btn'),
            delIcon: itemsArr[i].querySelector('.fa-trash')
        }
        if (event.target === buttons.done || event.target === buttons.doneIcon) {
            doneItemsTxt.push(itemsArr[i].querySelector('.item-input').value);
            itemsArr[i].classList.add('d-none');
        } else if (event.target === buttons.edit || event.target === buttons.editIcon) {
            input.removeAttribute('readonly');
            input.focus();
            itemsArr[i].classList.add('editing-item');
            buttons.done.classList.add('move-right');
            buttons.edit.classList.add('move-right');
            buttons.delete.classList.add('move-right');
            acceptButtonCreate(itemsArr[i]);
        } else if (event.target === buttons.delete || event.target === buttons.delIcon) {
            removeFromLocalStorage(buttons.delete, i, itemsArr);
        } 
    }
    // accept changes button
    const acceptBtns = document.querySelectorAll('.accept-btn');
    if (acceptBtns) {
        for (let i = 0; i < acceptBtns.length; i++) {
            if (event.target === acceptBtns[i]) {
                const currentItem = acceptBtns[i].closest('.item');
                const nearestInput = currentItem.querySelector('.item-input');
                currentItem.removeChild(acceptBtns[i]);
                currentItem.classList.remove('editing-item');
                // return buttons to their positions
                let btnsClasses = ['.done-btn', '.edit-btn', '.delete-btn'];
                for (let i = 0; i < btnsClasses.length; i++) {
                    currentItem.querySelector(btnsClasses[i]).classList.remove('move-right');
                }
                nearestInput.setAttribute('readonly', 'readonly');
                // find needed input
                const allInputs = document.getElementsByClassName('item-input');
                for (let j = 0; j < itemsArr.length; j++) {
                    if (allInputs[j] === nearestInput) {
                        let valuesArr = JSON.parse(localStorage.getItem('items'));
                        valuesArr[j] = nearestInput.value;
                        localStorage.setItem('items', JSON.stringify(valuesArr));
                        break;
                    }
                }
            }
        }
    }
}

function showCompletedItems(doneItemsArr, mainWrapper) {
    const doneUl = document.querySelector('.done-items-list');
    const doneWrapper = document.querySelector('.done-items-wrapper');
    for (let i = 0; i < doneItemsArr.length; i++) {
        let option = document.createElement('option');
        option.classList.add('done-list-item');
        option.textContent = doneItemsArr[i];
        doneUl.append(option);
    }
    doneWrapper.classList.remove('d-none');
    mainWrapper.classList.add('blur-effect');
}

function removeFromLocalStorage(delBtn, i, items) {
    if (confirm('This item will be removed forever, continue?')) {
        delBtn.closest('.item').remove();
        const itemsArr = JSON.parse(localStorage.getItem('items'));
        itemsArr.splice(i, 1);
        items.splice(i, 1);
        localStorage.setItem('items', JSON.stringify(itemsArr));
    }
}

function acceptButtonCreate(itemToPrepend) {
    const acceptBtn = document.createElement('button');
    acceptBtn.classList.add('accept-btn');
    acceptBtn.textContent = 'Accept Changes';
    itemToPrepend.prepend(acceptBtn);
}

function setItemsFromLocalStorage(parent) {
    let itemsTextArr = JSON.parse(localStorage.getItem('items'));
    let arrLength = itemsTextArr.length;
    let itemsArr = [];
    for (let i = 0; i < arrLength; i++) {
        let item = insertItemToList(itemsTextArr[i], parent)[0];
        itemsArr.push(item);
        setTimeout(() => {
            item.classList.remove('move-left');
        }, 0);
    }
    return itemsArr;
}

function insertItemToList(itemText, parentToInsert) {
    // create item
    const item = document.createElement('div');
    item.classList.add('move-left');
    item.classList.add('item');
    //create & insert input inside item
    const itemInput = document.createElement('input');
    itemInput.value = itemText;
    itemInput.classList.add('item-input');
    itemInput.setAttribute('readonly', 'readonly');
    itemInput.setAttribute('type', 'text');
    item.append(itemInput);
    //create buttons & i tags
    const classesForBtns = {
        forButtonTag: ['done', 'edit', 'delete'],
        forITag: ['check', 'edit', 'trash']
    }
    for (let i = 0; i < 3; i++) {
        const button = document.createElement('button');
        button.classList.add(classesForBtns.forButtonTag[i] + '-btn');
        const iTag = document.createElement('i');
        iTag.className = 'fas fa-' + classesForBtns.forITag[i];
        button.append(iTag);
        item.append(button);
    }
    // append item
    parentToInsert.append(item);
    setTimeout(() => {
        item.classList.remove('move-left');
    }, 0);
    return [item, itemInput];
}