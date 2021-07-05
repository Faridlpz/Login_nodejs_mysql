//Invocamos express
const express = require('express');
const app = express();

//Seteamos urlenconded para capturar datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());
// Invocamos Dotenv
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'})

//el directorio public 
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname+'/public'));

// 5.- Establecer motor de plantillas
app.set('view engine','ejs');

//6.- Invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//7 Var. de session
const session = require('express-session');
app.use(session({
    secret: '12345',
    resave: true,
    saveUninitialized:true
}));

//8.- Invocamos el modulo de la conexion de BD
const connection = require('./database/db');

//9.- Estableciendo las RUTAS

app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/register', (req,res)=>{
    res.render('register');
})
//registracion
app.post('/register', async (req,res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    connection.query('INSERT INTO users SET ?',{user:user,name:name,rol:rol,pass:passwordHaash}, async(err,results)=>{
        if(err){
            throw err;
            
        }else{
            res.render('register',{
                alert:true,
                alertTitle: "Registration",
                alertMessage: "Successful Registration",
                alertIcon: 'success',
                showConfirmButton:false,
                timer:1500,
                ruta:''
            })
        }
    })
})
//11 autenticacion
app.post('/auth', async (req,res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordhash = await bcryptjs.hash(pass,8);
    if(user && pass){
        connection.query('SELECT * FROM users where user= ?',[user], async (err,results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass,results[0].pass))){
                res.render('login',{
                    alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: 1500,
                        ruta: 'login'  
                })
            }else{
                req.session.loggedin = true;
                req.session.name= results[0].name
                res.render('login',{
                    alert: true,
                        alertTitle: "Conexion exitosa",
                        alertMessage: "Login correcto",
                        alertIcon:'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: ''  
                })
            }
        })
    }else{
        res.render('login',{
        alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un usuario y/o contraseña",
                alertIcon:'warning',
                showConfirmButton: true,
                timer: 1500,
                ruta: 'login'
        });
    }
})

// 12.- Auth pages
app.get('/',(req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login:true,
            name: req.session.name
        });
    }else{
        res.render('index',{
            login: false,
            name: 'Debe iniciar sesion'
        });
    }
})

//logout
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    })
})


app.listen(3000,(req,res)=>{
    console.log('Server ON');
})
