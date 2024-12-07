let data = null;
let cart = [];

// Fetches the data from data.json and renders it to the screen as well as adds events for different elements
const getItems = async(url) => {
    const res = await fetch(url);
    try {
        if (!res.ok) {
            throw new Error("Network response error occured");
        }
        data = await res.json();
        appendData(data);
        addControlEvents(null);
        addSubmitEvent();
        addResetEvent();
        return data;
    } catch (err) {
        console.log(err)
        alert("An error occured while trying to retrieve items. Reload page.");
    } 
}

getItems("./data.json");

const appendData = data => {
    const itemSection = document.getElementById("items");
    data.forEach((item, index) => {
        let itemCard = document.createElement("div");
        itemCard.className = "itemCard container-fluid row";
        itemCard.id = `container-${index}`
        itemSection.appendChild(itemCard);
        renderItemImage(item, itemCard, index);
        renderControls(itemCard, index);
        renderItemInfo(item, itemCard, index);
    })
}

// Based on screen width, this function appends the appropriate image type to the itemCard container
const renderItemImage = (data, itemCard, index) => {
    const { image, name } = data;
    const { mobile, tablet, desktop } = image;
    const screenWidth = window.innerWidth;
    const vowel = /^[AEIOU]/
    const startsWithVowel = vowel.test(name);

    let imageUrl;

    if (screenWidth >= 769) {
        imageUrl = desktop;
    } else if (screenWidth < 769 && screenWidth > 480) {
        imageUrl = tablet;
    } else {
        imageUrl = mobile;
    }

    const imageElement = document.createElement("img");
    setImage(imageElement, imageUrl, `An image of ${startsWithVowel ? "an" : "a"} ${name}`);
    imageElement.id = `card-image-${index}`;
    imageElement.className = "cardImage img-fluid rounded";
    itemCard.appendChild(imageElement);
}

// Renders the control button to the item card based on the itemCard to change and it's index
const renderControls = (itemCard, index) => {
    const categoryElement = document.getElementById(`category-${index}`);

    const controlsElement = document.createElement("div");
    const cartSvg = document.createElement("img");
    const controlsText = document.createTextNode("Add to Cart");
    controlsElement.id = `controls-${index}`;
    controlsElement.className = "controls";
    controlsElement.tabIndex = `${index}`
    setImage(cartSvg, "assets/images/icon-add-to-cart.svg", "Image of a cart");
    appendChildren(controlsElement, [cartSvg, controlsText]);
    
    if (itemCard.contains(categoryElement)) {
        categoryElement.insertAdjacentElement("beforebegin", controlsElement);
        addControlEvents(index);
    } else {
        itemCard.appendChild(controlsElement);
    }

};

// Renders the item name, category, and price text to the appropriate item
const renderItemInfo = (data, itemCard, index) => {
    const { name, category, price } = data;

    const categoryElement = document.createElement("p");
    categoryElement.id = `category-${index}`;
    categoryElement.className = "lightText";
    categoryElement.innerText = category;
    const nameElement = document.createElement("p");
    nameElement.id = `name-${index}`;
    nameElement.className = "boldText";
    nameElement.innerText = name;
    const priceElement = document.createElement("p");
    priceElement.id = `price-${index}`;
    priceElement.className = "redText";
    priceElement.innerText = `$${price.toFixed(2)}`;

    appendChildren(itemCard, [categoryElement, nameElement, priceElement]);
};

/*  If index is not null, addControlEvents adds the control events to a specfic passed index,
        if it is null, addControlEvents adds event listeners to every controls element */
const addControlEvents = (index) => {
    if (index !== null) {
        const controlElement = document.getElementById(`controls-${index}`);
        controlElement.addEventListener("click", (e) => handleIncrement(e));
    } else {
        const controlElements = document.querySelectorAll(".controls");
        controlElements.forEach((control) => {
          control.addEventListener("click", (e) => handleIncrement(e));
        });
    }
}

const addSubmitEvent = () => {
    const submitButton = document.getElementById("submit");
    const dialog = document.getElementById("confirmation");

    submitButton.addEventListener("click", (e) => {
        e.preventDefault;
        dialog.showModal();
        renderCart("modal");
    })
}

const addResetEvent = () => {
    const resetButton = document.getElementById("new-order");
    resetButton.addEventListener("click", reset);
}

// TO-DO: Further abstract function (Single Responsibility Principle)
/* This function initializes the in cart indicator and increment/decrement
    buttons for the control element on a specific item card if 
    newInstance === true. If newInstance === false, it will either change the
    control quantity label with the correct amound, or if the amount is zero
    remove the control element and re-render the original to the card.
*/
const updateItemCard = (controls, quantity, newInstance) => {
    
    let currentImage = controls.previousSibling;
    let controlElements = document.querySelectorAll(".controls");
    let cardIndex;

    controlElements.forEach((element, index) => {
        if (element.id === controls.id) {
            cardIndex = index;
        }
    })

    if (newInstance) { 
        const decrementBtn = document.createElement("button");
        const incrementBtn = document.createElement("button");
        const quantityLabel = document.createElement("span");
        const incrementImg = document.createElement("img");
        const decrementImg = document.createElement("img");

        controls.innerText = "";
        decrementBtn.id = `decrement-${cardIndex}`;
        incrementBtn.id = `increment-${cardIndex}`;
        decrementBtn.className = "controlBtns";
        incrementBtn.className = "controlBtns";
        quantityLabel.id = `quantity-label-${cardIndex}`;
        quantityLabel.textContent = quantity;

        setImage(
          decrementImg,
          "assets/images/icon-decrement-quantity.svg",
          "Decrement icon"
        );
        decrementBtn.ariaLabel = "Click to decrease amount";
        decrementBtn.appendChild(decrementImg);

        setImage(
          incrementImg,
          "assets/images/icon-increment-quantity.svg",
          "Increment icon"
        );
        incrementBtn.ariaLabel = "Click to increase amount";
        incrementBtn.appendChild(incrementImg);

        appendChildren(controls, [decrementBtn, quantityLabel, incrementBtn]);
        addAdjustEvents(decrementBtn, incrementBtn);

        controls.classList.add("redBtn");
        currentImage.classList.add("inCart");
    } else if (quantity >= 1 && !newInstance) {
        let controlChildren = controls.childNodes;
        let label;
        for (const child of controlChildren) {
            if (child.id === `quantity-label-${cardIndex}`) {
                label = child;
            }
        }
        label.textContent = quantity;
    } else {
        let currentCard = controls.parentNode;
        resetCard(controls, currentImage);
        renderControls(currentCard, cardIndex);
    }
};

const resetCard = (controls, image) => {
    controls.remove();
    image.classList.remove("inCart");
}

const reset = () => {
    const controlElements = document.querySelectorAll(".controls");
    const controlElementArray = [...controlElements];
    const cartItems = document.getElementById("cart-items");
    const modal = document.getElementById("confirmation");
    const checkoutTotal = document.getElementById("total");
    const checkoutNumItems = document.getElementById("num-items");
    for (let i = 0; i < controlElementArray.length; i++) {
        if (controlElementArray[i].classList.contains("redBtn")) {
            const imageToChange = document.getElementById(`card-image-${i}`);
            const cardToChange = document.getElementById(`container-${i}`);
            resetCard(controlElementArray[i], imageToChange);
            renderControls(cardToChange, i);
        }
    }
    cartItems.textContent = '';
    checkoutTotal.textContent = "$0";
    checkoutNumItems.textContent = "0";
    cart = [];
    modal.close();
}

const addAdjustEvents = (decrementBtn, incrementBtn) => {
    decrementBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleDecrement(e);
    });
    incrementBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleIncrement(e);
    });
}

// Handles the input of a control button being used to decrease quantity of an item
const handleDecrement = (event) => {
    let element = event.currentTarget;
    let controls = element.parentElement;
    let itemToDelete = cart.find((item) => item.button === controls.id);

    itemToDelete.quantity -= 1;

    if (itemToDelete.quantity === 0) {
        cart = cart.filter((item) => item.name != itemToDelete.name);
    }

    updateItemCard(controls, itemToDelete.quantity, false);
    renderCart("checkout");
};


// Handles the input of a control button being used to increase quantity of item
const handleIncrement = (event) => {
    let element = event.currentTarget;
    let controls = element.className === "controls" ? element : element.parentElement;
    let itemToAdd;
    let itemFound = false;

    // TO-DO: Change implementation of below loop. Will select first match as is, which could lead to bugs.
    for (let i = 0; i < data.length; i++) { 
        if (controls.id === `controls-${i}`) {
            itemToAdd = data[i];
            break;
        }
    }

    const { image, name, price } = itemToAdd;
    const { thumbnail } = image;
    let newItem = {
        name: name,
        price: Number(price.toFixed(2)),
        image: thumbnail,
        quantity: 1,
        button: controls.id
    };

    for (const item of cart) {
        if (item.name === newItem.name) {
            item.quantity += 1;
            updateItemCard(controls, item.quantity, false);
            itemFound = true;
            break;
        }
    }
    if (!itemFound) {
        cart.push(newItem);
        updateItemCard(controls, 1, true);
    }
    renderCart("checkout");
};


/* Renders the items in the cart object to the shopping cart portion of the UI if called with "checkout"
    or renders the items in the cart to the modal if called with "modal"
*/
const renderCart = (element) => {
    let grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

    if (element === "checkout") {
        let numItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const numItemsElement = document.getElementById("num-items");
        const totalElement = document.getElementById("total");
        const checkoutItems = document.getElementById("cart-items");
        checkoutItems.textContent = "";

        cart.forEach((item, index) => {
          let itemContainer = document.createElement("div");
          let itemHeader = document.createElement("p");
          let itemQuantity = document.createElement("p");
          let itemPrice = document.createElement("p");
          let itemTotal = document.createElement("p");
          let removeButton = document.createElement("button");
          let removeSvg = document.createElement("img");
          let itemCardIndex = data.findIndex(
            (element) => element.name === item.name
          );

          itemContainer.id = `cart-container-${index}`;
          itemContainer.className = "cartItemContainer";
          itemHeader.textContent = item.name;
          itemHeader.id = `cart-item-header-${index}`;
          itemHeader.className = "boldText";
          itemQuantity.textContent = `${item.quantity}x`;
          itemQuantity.id = `cart-quantity-${index}`;
          itemQuantity.className = "redText";
          itemPrice.textContent = `@ $${item.price.toFixed(2)}`;
          itemPrice.id = `cart-price-${index}`;
          itemPrice.className = "lightText";
          itemTotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
          itemTotal.id = `cart-total-${index}`;
          itemTotal.className = "moderateText";
          removeButton.id = `cart-remove-${index}`;
          setImage(
            removeSvg,
            "assets/images/icon-remove-item.svg",
            "Remove item icon"
          );

          removeButton.appendChild(removeSvg);
          removeButton.addEventListener("click", () => {
            removeFromCart(itemCardIndex, itemContainer.id, item.name);
          });
          removeButton.ariaLabel = "Click to remove item from cart";
          appendChildren(itemContainer, [
            itemHeader,
            itemQuantity,
            itemPrice,
            itemTotal,
            removeButton,
          ]);
          checkoutItems.appendChild(itemContainer);
        });

        numItemsElement.textContent = numItems;
        totalElement.textContent = grandTotal;
    } else if (element === "modal") {
         const modalTotalElement = document.getElementById("modal-total");
         const modalTotalContainer = document.getElementById("modal-total-container");
         cart.forEach((item, index) => {
            let modalItemContainer = document.createElement("div");
            let thumbnail = document.createElement("img");  
            let modalItemHeader = document.createElement("p");
            let modalItemQuantity = document.createElement("p");
            let modalItemPrice = document.createElement("p");
            let modalItemTotal = document.createElement("p"); 

            modalItemContainer.id = `modal-item-${index}`
            modalItemContainer.class = "modalItemContainer"
            setImage(thumbnail, item.image, `A picture of ${item.name}`);
            thumbnail.className = "rounded";
            modalItemHeader.textContent = item.name;
            modalItemHeader.className = "boldText";
            modalItemQuantity.textContent = `${item.quantity}x`;
            modalItemQuantity.className = "redText";
            modalItemPrice.textContent = `@ $${item.price.toFixed(2)}`;
            modalItemPrice.className = "lightText";
            modalItemTotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
            modalItemTotal.className = "boldText";

            appendChildren(modalItemContainer, [thumbnail, modalItemHeader,
                modalItemQuantity, modalItemPrice, modalItemTotal
            ]);
            modalTotalContainer.insertAdjacentElement("beforebegin", modalItemContainer);
         });
         modalTotalElement.textContent = grandTotal;
    }
};

const removeFromCart = (index, id, name) => {
    const itemInCart = document.getElementById(`${id}`);
    itemInCart.remove();

    cart = cart.filter((item) => item.name !== name);

    let grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let numItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const itemCard = document.getElementById(`container-${index}`);
    const controls = document.getElementById(`controls-${index}`);
    const itemImage = document.getElementById(`card-image-${index}`);
    document.getElementById("total").textContent = `$${grandTotal.toFixed(2)}`
    document.getElementById("num-items").textContent = `${numItems}`;

    resetCard(controls, itemImage);
    renderControls(itemCard, index);
}

// Helper functions below aiding in workflow -->

const setImage = (element, src, alt) => {
    element.src = src;
    element.alt = alt;
}

const appendChildren = (parent, children) => {
    children.forEach((child) => parent.appendChild(child));
}


