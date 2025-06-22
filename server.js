//importar los framewors necesarios para ejecutar
//la app 
const express=require('express');//SW
const mongoose=require('mongoose');//mongo
const bodyParser=require('body-parser');//json
const cors=require('cors');//permitir solicitudes 
const bcrypt=require('bcrypt');//encriptar
const { parseURL } = require('whatwg-url');

//crear una instancia de la aplicacion express
const app=express();
//definir el puerto donde se ejcutaara el server
const PORT = process.env.PORT || 3000; // USA EL PUERTO QUE ASIGNE RAILWAY O LOCAL 3000


//habilitar cors par permitir peticiones
app.use(cors());
// sentencia que permite a express entienda el formato
app.use(bodyParser.json());

//detectar archivos estaticos de la carpeta public
app.use(express.static('public'));

//conexion mongoDB

// CONEXIÓN A MONGODB ATLAS USANDO VARIABLE DE ENTORNO
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('CONECTADO A MONGODB ATLAS'))
.catch(err => console.error('ERROR DE CONEXIÓN:', err));

//Define el esquema para los usurios
const UsuarioSchema= new mongoose.Schema({
    nombre: String, 
    email: String,
    password: String
});

//crear el modelo usurio basado en el esquema anterior
const Usuario= mongoose.model('Usuario', UsuarioSchema);

//Definir esquema restaurante
const MenuSchema=new mongoose.Schema({
    nombre: String,
    precio: Number
});

const Menu= mongoose.model('Menu',MenuSchema);


const EmpleadosSchema= new mongoose.Schema({
   nombre: String,
   rol: String 
});

const Empleado= mongoose.model('Empleados',EmpleadosSchema);

const PedidoSchema= new mongoose.Schema({
    cliente: String,
    producto: String
});
 const Pedido= mongoose.model('Pedido',PedidoSchema);

 const ReservacionesSchema= new mongoose.Schema({
    Nombre: String,
    Numero_mesa: Number,
    Garantia:String
 });
 const Reservaciones= mongoose.model('Reservaciones', ReservacionesSchema);

 const ClienteSchema= new mongoose.Schema({
    Nombre: String,

    Apellido: String
 });
 const Clientes= mongoose.model('Clientes', ClienteSchema);

 //Rutas de autentificacion
 app.post ('/registro',async(req,res) => {
 
    //extrae el email y el password
    const{nombre,email,password}=req.body;

    //Encriptar la contraseña
    const hashedPassword=await bcrypt.hash(password,10);
   
    //crea un nuevo usuario con datos recibidos
    const nuevoUsuario= new Usuario({nombre,email,password: hashedPassword});

    //Guarda el usuario en la base de datos
    await nuevoUsuario.save();

    //Respone con un mensaje de exito
    res.status(201).send('Usuario registrado');

 });

 // Ruta para iniciar sesion 

 app.post('/login', async(req, res)=>{
    //Extraer imail y password del cuerpo de la solicitud
    const {email, password} = req.body;
    //Busca un usuario con el email dado
    const usuario = await Usuario.findOne({email});
    //Si no existe el usario, responde con error (error 401)
    if(!usuario)return res.status(401).send('Usuario no encontrado');
    //Compara la contraseña proporcionada
    const valid = await bcrypt.compare(password, usuario.password);
    //Si la constraseña no es valida responde con error 401
    if(!valid) return res.status(401).send('Contraseña incorrecta');
    //Si todo conincide responde con un mensaje de exito
    res.send('Bienvenido' + usuario.nombre);
 });

 // CRUD restaurante

 //Ruta para obtener todos los platillos
 app.get('/api/Menu', async(req, res) =>{
    //busca todos los platillos en la base 
    const menu=await Menu.find();
    //devuelve la lista de platillos en formato JSON 
    res.json(menu);
 });



 //crear un nuevo platillo
 app.post('/api/Menu', async(req, res)=>{
    //crea un nuevo platillo
    const nuevo = new Menu(req.body);
    //guarda el platillo en la base de datos 
    await nuevo.save();
//responde con un mensaje de exito
res.status(201).send ('platillo creado');
 });

 //eliminar un platillo por id
 app.delete('/api/Menu/:id', async(req,res)=>{
    //elimina el platillo cuyo id se recibe 
    await Menu.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('platillo eliminado');
 });


  // CRUD empleados
 
  //Ruta para obtener todos los empleados
 app.get('/api/Empleados', async(req, res) =>{
    //busca todos los empleados en la base 
    const Empleados=await Empleado.find();
    //devuelve la lista de empleados en formato JSON 
    res.json(Empleados);
 });


 //crear un nuevo empleado
 app.post('/api/Empleados', async(req, res)=>{
    //crea un nuevo empleado con los datos recibidos en la solicitud
    const nuevo = new Empleado(req.body);
    //guarda el empleado en la base de datos 
    await nuevo.save();
//responde con un mensaje de exito
res.status(201).send ('Empleado creado');
 });

 //eliminar un empleado por id
 app.delete('/api/Empleados/:id', async(req,res)=>{
    //elimina el empleado cuyo id se recibe 
    await Empleado.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('Empleado eliminado');
 });

 // CRUD pedidos

//Ruta para obtener todos los pedidos
app.get('/api/Pedidos',async(req,res)=>{
   //Busca todos los pedidos en la base de datos
   const Pedidos=await Pedido.find();
   //Devuelve la lista de pedidos en formato JSON
   res.json(Pedidos);
});

//Ruta para crear un nuevo pedido
app.post('/api/Pedidos',async(req,res)=>{
   //crea un nuevo pedido con los datos recibidos en la 
   const nuevo=new Pedido (req.body);
   //guarda el pedido en la base de datos
   await nuevo.save();
   //Responde con mensaje de exito y codigo 201(creado)
   res.status(201).send('Pedido registrado');
});

//Ruta para eliminar un pedido por su Id
app.delete('/api/Pedidos/:id', async(req,res)=>{
    //elimina el pedido cuyo id se recibe en la url
    await Pedido.findByIdAndDelete(req.params.id);
    //responde con mensaje de exito
    res.send('Pedido eliminado');
});

// CRUD clientes
 
  //Ruta para obtener todos los clientes
 app.get('/api/Clientes', async(req, res) =>{
    //busca todos los clientes en la base 
    const clientes=await Clientes.find();
    //devuelve la lista de clientes en formato JSON 
    res.json(clientes);
 });


 //crear un nuevo cliente
 app.post('/api/Clientes', async(req, res)=>{
    //crea un nuevo cliente con los datos recibidos en la solicitud
    const nuevo = new Clientes(req.body);
    //guarda el cliente en la base de datos 
    await nuevo.save();
//responde con un mensaje de exito
res.status(201).send ('Cliente creado');
 });

 //eliminar un cliente por id
 app.delete('/api/Clientes/:id', async(req,res)=>{
    //elimina el cliente cuyo id se recibe 
    await Clientes.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('Cliente eliminado');
 });


 // CRUD empleados
 
  //Ruta para obtener todos la reservacion
 app.get('/api/Reservaciones', async(req, res) =>{
    //busca todos los empleados en la base 
    const reservacion=await Reservaciones.find();
    //devuelve la lista de empleados en formato JSON 
    res.json(reservacion);
 });


 //crear una nueva reservacion
 app.post('/api/Reservaciones', async(req, res)=>{
    //crea una nueva reservacion con los datos recibidos en la solicitud
    const nuevo = new Reservaciones(req.body);
    //guarda la reservacion en la base de datos 
    await nuevo.save();
//responde con un mensaje de exito
res.status(201).send ('Reservacion creada');
 });

 //eliminar una resevacion por id
 app.delete('/api/Reservaciones/:id', async(req,res)=>{
    //elimina la reservacion cuyo id se recibe 
    await Reservaciones.findByIdAndDelete(req.params.id);
    //responde con un mensaje de exito
    res.send('Reservacion eliminado');
 });

//iniciar servidor
//inicia el servidor y lo pone a escuchar en el puerto definido
app.listen (3000, ()=>{
    //muestra en la consola la URL donde esta coriendo el servidor
    console.log('Servidor escuchando en http://localhost:3000');
});
