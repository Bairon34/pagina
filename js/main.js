// Se obtiene el canvas y el contexto
const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

// Se crea la imagen y se le asigna la ruta
const image = new Image();
image.src = "../img/mapa.png";

// Variables para controlar el estado del mapa
let scale = 2;
let minScale = 1;
let maxScale = 3;

let offsetX = -250;
let offsetY = -150;

let lastTouchX, lastTouchY;
let startX = 0;
let startY = 0;

let isDragging = false;
let hoveredPin = null;
let pinRadius = 20;

// Se obtienen los elementos del info box
const infoBoxTitle = document.getElementById("txtTitle");
const infoBox = document.getElementById("txtText");
const infoBoxLink = document.getElementById("txtLink");

// Se crea un arreglo con la información de los marcadores del mapa
const locations = [
  {
    x: 500,
    y: 310,
    name: "Barrio el charco",
    href: "lugar.html#ciudad-de-lagrimas",
    info: "Barrio en Ipiales, Nariño, Colombia, que se encuentra en la frontera con Ecuador y es la puerta de entrada a la vía que conduce directamente al Santuario de Nuestra Señora de Las Lajas. Es un lugar colorido que resalta la cultura y la tradición de los pueblos nariñenses, plasmadas en las fachadas de las casas y plazuelas que fueron pintadas con la asesoría y diseños del maestro nariñense Carlos Santacruz.",
    location: "../img/cuy.png"
  },
  {
    x: 590,
    y: 370,
    name: "Santuario",
    href: "lugar.html#ciudad-de-lagrimas",
    info: "El Santuario de Las Lajas se encuentra en la carretera Panamericana a 7 kilómetros al norte de la ciudad de Ipiales, Nariño. Desde Ipiales parten buses y taxis colectivos hasta el templo.",
    location: "../img/iglesia.png"
  },
  {
    x: 250,
    y: 250,
    name: "Centro",
    href: "lugar.html#ciudad-de-lagrimas",
    info: "Para llegar al centro de la ciudad de Ipiales, puedes utilizar diferentes medios de transporte como autobuses, taxis o caminar si estás cerca.",
    location: "../img/ciudad.png"
  }
];

// Función para dibujar la imagen
function drawImage() {

  console.log(image.width * scale)
  console.log(image.height * scale)

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Se limpia el canvas
  ctx.drawImage(
    image,
    offsetX,
    offsetY,
    1500,
    1100,
  ); // Se dibuja la imagen principal del mapa
  drawPins(); // Se dibujan todos los marcadores
}

// Se asigna la acción de dibujar la imagen cuando la imagen se carga
image.onload = drawImage;

// Función para restringir el desplazamiento del mapa evitando que se salga de la pantalla
function restrictOffset() {
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const minX = canvas.width - scaledWidth;
  const minY = canvas.height - scaledHeight;
  offsetX = Math.min(0, Math.max(offsetX, minX));
  offsetY = Math.min(0, Math.max(offsetY, minY));
}

function drawPins() {
  locations.forEach((location) => {
    const { x, y } = location;

    const scaledX = x * scale + offsetX;
    const scaledY = y * scale + offsetY;

    const image = new Image();

    console.log(pinRadius * 2)

    image.src = location.location;
    ctx.filter = "drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.5))";
    ctx.drawImage(
      image,
      scaledX - pinRadius,
      scaledY - pinRadius,
      100,
      100,
    );
  });

  if (hoveredPin) {
    const { x, y, name } = hoveredPin;
    const scaledX = x * scale + offsetX;
    const scaledY = y * scale + offsetY;
    ctx.font = "18px Trajan Pro Regular";
    const textWidth = ctx.measureText(name).width;
    const textHeight = ctx.measureText("M").width;
    ctx.fillStyle = "black";
    ctx.fillRect(
      scaledX - textWidth / 2 - 2,
      scaledY - textHeight - 2,
      textWidth + 5,
      textHeight + 5,
    );
    ctx.fillStyle = "white";
    ctx.fillText(name, scaledX - textWidth / 2, scaledY - 2);
  }
}

// Función para obtener la posición del mouse respecto al canvas
function getMousePos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

// Se agrega un evento para detectar el movimiento de la rueda del mouse y realizar el zoom
canvas.addEventListener("wheel", function (e) {
  e.preventDefault(); // Se evita que la página haga scroll

  // Se obtiene la posición del mouse respecto al canvas
  const { x: mouseX, y: mouseY } = getMousePos(e.clientX, e.clientY);

  const prevScale = scale;
  if (e.deltaY < 0 && scale < maxScale) scale += 0.1;
  if (e.deltaY > 0 && scale > minScale) scale -= 0.1;

  // Se calcula el desplazamiento del mapa para que el zoom se haga en el punto donde se encuentra el mouse
  offsetX = offsetX - (mouseX / prevScale - mouseX / scale) * scale;
  offsetY = offsetY - (mouseY / prevScale - mouseY / scale) * scale;

  restrictOffset(); // Se restringe el desplazamiento del mapa
  drawImage(); // Se vuelve a dibujar la imagen
});

// Se agregan los eventos para controlar el desplazamiento del mapa
canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});
canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    restrictOffset();
    drawImage();
  }
});
canvas.addEventListener("mouseup", () => (isDragging = false));
canvas.addEventListener("mouseleave", () => (isDragging = false));

// Se agrega evento para hover en los pins
canvas.addEventListener("mousemove", function (e) {
  const { x: mouseX, y: mouseY } = getMousePos(e.clientX, e.clientY);
  hoveredPin = locations.find((location) => {
    const scaledX = location.x * scale + offsetX;
    const scaledY = location.y * scale + offsetY;
    const distance = Math.sqrt(
      Math.pow(mouseX - scaledX, 2) + Math.pow(mouseY - scaledY, 2),
    );
    return distance < pinRadius;
  });

  if (hoveredPin) canvas.style.cursor = "pointer";
  else canvas.style.cursor = "grab";

  drawImage();
});

// Se agrega evento para click en los pins
canvas.addEventListener("click", function (e) {
  const { x: mouseX, y: mouseY } = getMousePos(e.clientX, e.clientY);
  const clickedPin = locations.find((location) => {
    const scaledX = location.x * scale + offsetX;
    const scaledY = location.y * scale + offsetY;
    const distance = Math.sqrt(
      Math.pow(mouseX - scaledX, 2) + Math.pow(mouseY - scaledY, 2),
    );
    return distance < pinRadius;
  });
  if (clickedPin) {
    infoBoxTitle.innerHTML = clickedPin.name;
    infoBox.innerHTML = clickedPin.info;
    infoBoxLink.href = clickedPin.href;
  }
});

// Eventos para detectar movimiento de los dedos en el mapa y realizar el zoom
canvas.addEventListener("touchstart", function (e) {
  if (e.touches.length === 2) {
    lastTouchX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
    lastTouchY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
  } else if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX - offsetX;
    startY = e.touches[0].clientY - offsetY;
  }
});

canvas.addEventListener("touchmove", function (e) {
  e.preventDefault();
  if (isDragging && e.touches.length === 1) {
    offsetX = e.touches[0].clientX - startX;
    offsetY = e.touches[0].clientY - startY;
  } else if (e.touches.length === 2) {
    const currentTouchX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
    const currentTouchY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);

    const deltaScaleX = currentTouchX - lastTouchX;
    const deltaScaleY = currentTouchY - lastTouchY;

    const prevScale = scale;
    if (deltaScaleX > 0 && deltaScaleY > 0 && scale < maxScale) scale += 0.1;
    if (deltaScaleX < 0 && deltaScaleY < 0 && scale > minScale) scale -= 0.1;

    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    offsetX -= (midX / prevScale - midX / scale) * scale;
    offsetY -= (midY / prevScale - midY / scale) * scale;

    lastTouchX = currentTouchX;
    lastTouchY = currentTouchY;
  }
  restrictOffset();
  drawImage();
});

canvas.addEventListener("touchend", function (e) {
  isDragging = false;
  const { x: mouseX, y: mouseY } = getMousePos(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY,
  );
  const clickedPin = locations.find((location) => {
    const scaledX = location.x * scale + offsetX;
    const scaledY = location.y * scale + offsetY;
    const distance = Math.sqrt(
      Math.pow(mouseX - scaledX, 2) + Math.pow(mouseY - scaledY, 2),
    );
    return distance < pinRadius;
  });

  if (clickedPin) {
    infoBoxTitle.innerHTML = clickedPin.name;
    infoBox.innerHTML = clickedPin.info;
    infoBoxLink.href = clickedPin.href;
    infoBoxLink.innerHTML = "...ver más";
  }
});
