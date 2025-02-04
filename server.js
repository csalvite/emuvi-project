const morgan = require('morgan');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Creamos servidor express
const app = express();

const { PORT } = process.env;

// Problemas con Cors a la hora de realizar peticiones a servidor, por lo que probamos lo siguiente
app.use(cors());

app.options('*', cors());

// Desserializa body en formato raw
app.use(express.json());

// La morgana para support e info
app.use(morgan('dev'));

// Middleware para leer body en formato form-data
app.use(fileUpload());

// Cargamos las fotos para mails
app.use(express.static('static'));

/*
 * #################
 * ## Middlewares ##
 * #################
 * */

const canEditProduct = require('./middlewares/canEditProduct');
const productExists = require('./middlewares/productExists');
const isAuth = require('./middlewares/isAuth');
const userExists = require('./middlewares/userExists');
const canEditUser = require('./middlewares/canEditUser');
const canVote = require('./middlewares/canVote');
const canEditVote = require('./middlewares/canEditVote');

/*
 * ###############################
 * ## Controladores de usuarios ##
 * ###############################
 * */

const {
    loginUser,
    editUser,
    newUser,
    validateUser,
    deleteUser,
    getPublicUser,
    editUserAvatar,
    editUserData,
    editUserPassword,
    userProducts,
    getPrivateUser,
    confirmNewUserMail,
    loginAuth0,
} = require('./controllers/user');

/*
 * ##############################
 * ## Controladores de ofertas ##
 * ##############################
 * */

const {
    userBookings,
    userSales,
    deleteUserBookings,
    homeLists,
    deleteUserSales,
    newOffer,
    deniedOffer,
    acceptOffer,
} = require('./controllers/offers/');

/*
 * ################################
 * ## Controladores de productos ##
 * ################################
 * */

const {
    deleteProduct,
    detailedProduct,
    editProduct,
    addProductPhoto,
    deleteProductPhoto,
    listProducts,
    newProduct,
} = require('./controllers/product');

/*
 * ################################
 * ## Controladores de favoritos ##
 * ################################
 * */

const {
    addFavProduct,
    deleteFavProducts,
    listUserFavProducts,
} = require('./controllers/favorite');

/*
 * ###########################
 * ## Controladores ratings ##
 * ###########################
 * */

const {
    newRatings,
    deleteRatings,
    editRatings,
    userListRatings,
} = require('./controllers/ratings');

/* 
#####################################
### Endpoints Inicio de la página ###
#####################################
*/

// Carga dos listados con las categorias y los 10 productos más nuevos
app.get('/', homeLists);

/* 
######################
### Endpoints User ###
######################
*/

// Nuevo usuario
// validateUser
app.post('/users', newUser);

// Nuevo usuario con Auth0
// app.post('/newuser', loginAuth0);

// Completa registro y activa usuario
app.post('/users/register/:registrationCode', validateUser);

// Logeamos a un usuario y retornamos un token.
app.post('/users/login', loginUser);

// Retornamos info de un usuario público
app.get('/users/:idUser', userExists, getPublicUser); // Si el usuario es anónimo no tiene una Authorization, podrá ver igual los datos?

// Info para el usuario perfil privado
app.get('/profile', isAuth, getPrivateUser);

// Actualizamos el avatar de un usuario
app.put(
    '/users/:idUser/avatar',
    isAuth,
    userExists,
    canEditUser,
    editUserAvatar
);

// Editamos username e email de Usuario
app.put('/users/:idUser', isAuth, userExists, canEditUser, editUser);

// Activamos de nuevo el usuario con nuevo correo
app.post('/users/mail/:registrationCode', confirmNewUserMail);

// Editamos la contraseña del usuario
app.put(
    '/users/:idUser/password',
    isAuth,
    userExists,
    canEditUser,
    editUserPassword
);

// Editamos información del usuario (datos personales y de dirección)
app.put('/users/:idUser/info', isAuth, userExists, canEditUser, editUserData);

// Borramos usuario
app.delete('/users/:idUser', deleteUser);

// Mi perfil -> Mis productos
app.get('/users/:idUser/products', isAuth, userExists, userProducts);

/* 
  ##########################
  ### Endpoints Products ###
  ##########################
*/

// Lista de productos
app.get('/products', listProducts);

// Nuevo producto
app.post('/products/new', isAuth, newProduct);

// Añade fotos a un producto
app.post(
    '/products/:idProduct/addphoto',
    isAuth,
    productExists,
    canEditProduct,
    addProductPhoto
);

// Edita un producto
app.put(
    '/products/:idProduct',
    isAuth,
    productExists,
    canEditProduct,
    editProduct
);

// Añade fotos de producto
app.post(
    '/products/:idProduct/photos',
    isAuth,
    productExists,
    canEditProduct,
    addProductPhoto
);

// Devuelve datos de un producto en concreto
app.get('/products/:idProduct', productExists, detailedProduct);

// Borra un producto seleccionado por el usuario propietario
app.delete(
    '/products/:idProduct',
    isAuth,
    productExists,
    canEditProduct,
    deleteProduct
);

// Borra las imagenes de un producto por el usuario propietario
app.delete(
    '/products/:idProduct/photos/:idImg',
    isAuth,
    productExists,
    canEditProduct,
    deleteProductPhoto
);

/* 
###########################
### Endpoints favoritos ###
###########################
*/

// Lista y filtra los productos marcados como favoritos por el usuario
app.get(
    '/users/:idUser/favorites',
    isAuth,
    userExists,
    canEditUser,
    listUserFavProducts
);

// Añade un producto a favoritos
app.post('/products/:idProduct/favorite', isAuth, productExists, addFavProduct);

// Borra un producto de los favoritos del usuario
app.delete(
    '/user/:idUser/favorites/:idProduct',
    isAuth,
    userExists,
    canEditUser,
    deleteFavProducts
);

/* 
  ########################
  ### Endpoints Offers ###
  ########################
*/

// Perfil de usuario -> sus ofertas enviadas (las reservas)
app.get(
    '/users/:idUser/bookings',
    isAuth,
    userExists,
    canEditUser,
    userBookings
);

// Perfil de usuario -> ofertas recibidas
app.get('/users/:idUser/offers', isAuth, userExists, canEditUser, userSales);

// Endpoint que crea una nueva oferta
app.post(
    '/offers/:idProduct/new/:idUser',
    isAuth,
    userExists,
    productExists,
    newOffer
);

// Acepta la reserva
app.post(
    '/users/:idUser/offers/:idOffer/accept',
    isAuth,
    userExists,
    canEditUser,
    acceptOffer
);

// Deniega la reserva
app.post(
    '/users/:idUser/offers/:idOffer/deny',
    isAuth,
    userExists,
    canEditUser,
    deniedOffer
);

// Elimina las reservas en estado "denegada" del usuario
app.delete(
    '/users/:idUser/bookings',
    isAuth,
    userExists,
    canEditUser,
    deleteUserBookings
);

// Elimina las ofertas recibidas por el usuario si recibe un query param indicando qué estado de oferta o qué id quiere borrar
app.delete(
    '/users/:idUser/offers',
    isAuth,
    userExists,
    canEditUser,
    deleteUserSales
);

/* 
#########################
### Endpoints Ratings ###
#########################
*/

// New Rating
app.post('/users/:idUser/votes/:idProduct', isAuth, canVote, newRatings);

// Edit Rating
app.put('/users/vote/:idVote', isAuth, canEditVote, editRatings);

// Delete Votes
app.delete('/users/vote/:idVote', isAuth, canEditVote, deleteRatings);

// User Ratings List
app.get('/users/:idUser/vote', userListRatings);

/*
  #####################################
  ### Middlewares Error y Not Found ###
  #####################################
*/

app.use((error, req, res, _) => {
    console.error(error);
    res.status(error.httpStatus || 500).send({
        status: 'Error',
        message: error.message,
    });
});

// Middleware not found

app.use((req, res) => {
    res.status(404).send({
        status: 'error',
        message: 'Not Found',
    });
});

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
