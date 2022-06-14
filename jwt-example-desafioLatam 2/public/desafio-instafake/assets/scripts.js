//Le agrega funcionalidad a boton login
$("#js-form-login").submit(async (event) => {
  event.preventDefault();
  const email = document.getElementById("js-input-email").value;
  const password = document.getElementById("js-input-password").value;
  const JWT = await postData(email, password);
  const photos = await getPhotos(JWT);
});

//Envia datos para login y guarda token en el local storage
const postData = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
    });
    const { token } = await response.json();
    // Se guarda el JWT en localStorage
    localStorage.setItem("jwt-token", token);
    return token;
  } catch (err) {
    console.error(`Error: ${err} `);
  }
};

// Oculta el formulario inicial, y muestra el feed
const toggleFormAndFeed = (form, table) => {
  $(`#${form} `).toggle();
  $(`#${table} `).toggle();
};

// Con JWT consumir API localhost:3000/api/photos, además llama a la funcion appendPhotosToFeed y el toggleFormAndFeed
const getPhotos = async (jwt) => {
  try {
    const response = await fetch(`http://localhost:3000/api/photos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt} `,
      },
    });
    const { data } = await response.json();
    if (data) {
      appendPhotosToFeed(data);
      toggleFormAndFeed("js-form-wrapper", "js-feed-wrapper");
    }
  } catch (err) {
    localStorage.clear();
    console.error(`Error: ${err} `);
  }
};

// Crea elementos html para mostrar los datos recibidos de la API en el sitio
const appendPhotosToFeed = (data) => {
  $.each(data, (i, item) => {
    let card = `<div class="card my-4">
                  <img src=" ${item.download_url} " class="card-img-top" alt="...">
                <div class="card-body">
                  <p class="card-text">
                  Autor: ${item.author}
                  </p>
                </div>
                </div>`;
    $(`#js-feed-photos`).append(card);
  });
};

// IIFE (inmediately invoked function expression) checkea la existencia de JWT en localStorage y carga el feed si existe
(() => {
  const token = localStorage.getItem("jwt-token");
  if (token) {
    getPhotos(token);
  }
})()

// variable de paginacion, empieza en 2 para cargar desde la segunda pagina. Primera pagina se carga al hacer submit del login o con la IIFE anterior
let page = 2;

// boton para cargar mas fotos, hace el llamado a la api siempre que el contador de paginacion sea menor a 10, aumenta el contador luego de cargar mas fotos
document.getElementById("load-more").addEventListener("click", async () => {
  const token = localStorage.getItem("jwt-token");
  if (page <= 10) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/photos?page=${page}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { data } = await response.json();
      //carga los nuevos elementos
      if (data) {
        appendPhotosToFeed(data)
      }
    } catch (err) {
      localStorage.clear();
      console.error(`Error: ${err}`);
    }
    //suma un numero para asignar a la nueva consulta
    page++;
    if (page == 11) {
      document.getElementById("js-card-wrapper").innerHTML =
        "No hay mas elementos para mostrar";
    }
  }
});

// Crear botón logout que elimine el JWT almacenado y volver a la aplicación al estado inicial.
document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});